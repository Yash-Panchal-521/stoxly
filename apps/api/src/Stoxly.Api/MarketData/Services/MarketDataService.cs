using Microsoft.Extensions.Logging;
using Stoxly.Api.MarketData.Caching;
using Stoxly.Api.MarketData.Clients;
using Stoxly.Api.MarketData.DTOs;
using Stoxly.Api.MarketData.Interfaces;
using Stoxly.Api.Models;
using Stoxly.Api.Repositories;

namespace Stoxly.Api.MarketData.Services;

public sealed class MarketDataService : IMarketDataService
{
    private const string DateFormat = "yyyy-MM-dd";
    private static readonly TimeSpan PriceCacheTtl = TimeSpan.FromSeconds(60);
    private static readonly TimeSpan SearchCacheTtl = TimeSpan.FromMinutes(5);

    private readonly IFinnhubClient _finnhubClient;
    private readonly IAlphaVantageClient _alphaVantageClient;
    private readonly IMarketDataCache _cache;
    private readonly ISymbolRepository _symbolRepository;
    private readonly ILogger<MarketDataService> _logger;

    public MarketDataService(
        IFinnhubClient finnhubClient,
        IAlphaVantageClient alphaVantageClient,
        IMarketDataCache cache,
        ISymbolRepository symbolRepository,
        ILogger<MarketDataService> logger)
    {
        _finnhubClient = finnhubClient;
        _alphaVantageClient = alphaVantageClient;
        _cache = cache;
        _symbolRepository = symbolRepository;
        _logger = logger;
    }

    public async Task<StockPriceDto?> GetPriceAsync(string symbol)
    {
        var normalised = symbol.Trim().ToUpperInvariant();
        var key = CacheKey.Price(normalised);

        var cached = await _cache.GetAsync<StockPriceCacheEntry>(key);
        if (cached is not null)
            return CacheEntryToDto(normalised, cached);

        var price = await _finnhubClient.GetQuoteAsync(normalised);
        if (price is not null)
            await _cache.SetAsync(key, DtoToCacheEntry(price), PriceCacheTtl);

        return price;
    }

    public async Task<IReadOnlyList<StockPriceDto>> GetPricesAsync(IEnumerable<string> symbols)
    {
        var distinct = symbols
            .Select(s => s.Trim().ToUpperInvariant())
            .Where(s => !string.IsNullOrEmpty(s))
            .Distinct()
            .ToList();

        if (distinct.Count == 0)
            return [];

        // Check all cache entries concurrently first.
        var cacheTasks = distinct.Select(t => (Ticker: t, Task: _cache.GetAsync<StockPriceCacheEntry>(CacheKey.Price(t))));
        var cacheResults = await Task.WhenAll(cacheTasks.Select(x => x.Task));

        var hits = new List<StockPriceDto>(distinct.Count);
        var misses = new List<string>();

        for (var i = 0; i < distinct.Count; i++)
        {
            if (cacheResults[i] is not null)
                hits.Add(CacheEntryToDto(distinct[i], cacheResults[i]!));
            else
                misses.Add(distinct[i]);
        }

        if (misses.Count > 0)
        {
            var fresh = await _finnhubClient.GetBulkQuotesAsync(misses);
            var storeTasks = fresh.Select(p => _cache.SetAsync(CacheKey.Price(p.Symbol), DtoToCacheEntry(p), PriceCacheTtl));
            await Task.WhenAll(storeTasks);
            hits.AddRange(fresh);
        }

        return hits.AsReadOnly();
    }

    public async Task<IReadOnlyList<SymbolSearchResultDto>> SearchSymbolsAsync(string query)
    {
        var cacheKey = CacheKey.Search(query);
        var cached = await _cache.GetAsync<List<SymbolSearchResultDto>>(cacheKey);
        if (cached is not null)
            return cached;

        // 1. Search local database
        var localSymbols = await _symbolRepository.SearchSymbolsAsync(query);
        var results = localSymbols
            .Select(s => new SymbolSearchResultDto(s.Ticker, s.Name ?? string.Empty, s.Exchange ?? string.Empty))
            .ToList();

        // 2. Supplement with Finnhub when local results are thin
        if (results.Count < 5)
        {
            var apiResults = await _finnhubClient.SearchSymbolsAsync(query);
            if (apiResults.Count > 0)
            {
                await PersistSymbolsAsync(apiResults);

                var existingTickers = results
                    .Select(r => r.Symbol)
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);

                var merged = apiResults
                    .Where(a => !existingTickers.Contains(a.Symbol))
                    .Select(a => new SymbolSearchResultDto(a.Symbol, a.Description, string.Empty));

                results.AddRange(merged);
            }
        }

        if (results.Count > 0)
            await _cache.SetAsync(cacheKey, results, SearchCacheTtl);

        return results.AsReadOnly();
    }

    private static StockPriceCacheEntry DtoToCacheEntry(StockPriceDto p) =>
        new(p.CurrentPrice, p.Change, p.ChangePercent, p.HighPrice, p.LowPrice, p.OpenPrice, p.PreviousClose, p.Timestamp);

    private static StockPriceDto CacheEntryToDto(string symbol, StockPriceCacheEntry e) =>
        new(symbol, e.Price, e.Change, e.ChangePercent, e.HighPrice, e.LowPrice, e.OpenPrice, e.PreviousClose, e.UpdatedAt);

    public async Task<IReadOnlyDictionary<DateOnly, decimal>> GetDailyClosesAsync(
        string symbol, DateOnly from, DateOnly to)
    {
        var normalised = symbol.Trim().ToUpperInvariant();

        // Historical data is immutable once the trading day closes — cache 24 h.
        // Use string-keyed dict because DateOnly is not directly JSON-serialisable
        // by the default System.Text.Json converters in all target runtimes.
        var cacheKey = $"stock:candles:{normalised}:{from.ToString(DateFormat)}:{to.ToString(DateFormat)}";
        var cached = await _cache.GetAsync<Dictionary<string, decimal>>(cacheKey);
        if (cached is not null)
            return cached.ToDictionary(
                kvp => DateOnly.ParseExact(kvp.Key, DateFormat, System.Globalization.CultureInfo.InvariantCulture),
                kvp => kvp.Value);

        var closes = await _finnhubClient.GetDailyClosesAsync(normalised, from, to);

        if (closes.Count > 0)
        {
            var serialisable = closes
                .ToDictionary(kvp => kvp.Key.ToString(DateFormat), kvp => kvp.Value);
            await _cache.SetAsync(cacheKey, serialisable, TimeSpan.FromHours(24));
        }

        return closes;
    }

    private static readonly TimeSpan HistoricalPriceCacheTtl = TimeSpan.FromHours(24);

    public async Task<StockHistoricalPriceDto?> GetHistoricalPriceAsync(string symbol, DateOnly date)
    {
        var normalised = symbol.Trim().ToUpperInvariant();
        var dateStr = date.ToString(DateFormat);
        var cacheKey = CacheKey.HistoricalPrice(normalised, dateStr);

        var cached = await _cache.GetAsync<StockHistoricalPriceDto>(cacheKey);
        if (cached is not null)
        {
            _logger.LogDebug(
                "Cache hit for historical price {Symbol} on {Date}", normalised, dateStr);
            return cached;
        }

        _logger.LogInformation(
            "Fetching historical price for {Symbol} on {Date}", normalised, dateStr);

        try
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            if (date == today)
            {
                // Today: use live Finnhub quote — intraday candle data is not yet settled.
                var quote = await GetPriceAsync(normalised);
                if (quote is null)
                {
                    _logger.LogWarning("No live price available for {Symbol}", normalised);
                    return null;
                }
                // GetPriceAsync already caches with PriceCacheTtl; skip the 24 h cache.
                return new StockHistoricalPriceDto(normalised, dateStr, quote.CurrentPrice);
            }

            // Historical date: use AlphaVantage TIME_SERIES_DAILY.
            var closes = await _alphaVantageClient.GetDailyClosesAsync(normalised, date, date);

            if (!closes.TryGetValue(date, out var price))
            {
                _logger.LogWarning(
                    "No historical price data available for {Symbol} on {Date}",
                    normalised, dateStr);
                return null;
            }

            var result = new StockHistoricalPriceDto(normalised, dateStr, price);
            await _cache.SetAsync(cacheKey, result, HistoricalPriceCacheTtl);

            _logger.LogInformation(
                "Historical price for {Symbol} on {Date}: {Price}",
                normalised, dateStr, price);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error fetching price for {Symbol} on {Date}",
                normalised, dateStr);
            return null;
        }
    }

    private Task PersistSymbolsAsync(IReadOnlyList<StockSymbolDto> dtos)
    {
        var entities = dtos.Select(d => new Symbol
        {
            Ticker = d.Symbol.Trim().ToUpperInvariant(),
            Name = d.Description,
            Type = d.Type
        });

        return _symbolRepository.InsertSymbolsAsync(entities);
    }
}

internal static class CacheKey
{
    public static string Price(string symbol) => $"stock:price:{symbol}";
    public static string Search(string query) => $"market:search:{query.Trim().ToLowerInvariant()}";
    public static string HistoricalPrice(string symbol, string date) => $"stock:historical:{symbol}:{date}";
}
