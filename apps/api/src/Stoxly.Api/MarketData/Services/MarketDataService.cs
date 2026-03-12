using Stoxly.Api.MarketData.Caching;
using Stoxly.Api.MarketData.Clients;
using Stoxly.Api.MarketData.DTOs;
using Stoxly.Api.MarketData.Interfaces;
using Stoxly.Api.Models;
using Stoxly.Api.Repositories;

namespace Stoxly.Api.MarketData.Services;

public sealed class MarketDataService : IMarketDataService
{
    private static readonly TimeSpan PriceCacheTtl = TimeSpan.FromSeconds(60);
    private static readonly TimeSpan SearchCacheTtl = TimeSpan.FromMinutes(5);

    private readonly IFinnhubClient _finnhubClient;
    private readonly IMarketDataCache _cache;
    private readonly ISymbolRepository _symbolRepository;

    public MarketDataService(IFinnhubClient finnhubClient, IMarketDataCache cache, ISymbolRepository symbolRepository)
    {
        _finnhubClient = finnhubClient;
        _cache = cache;
        _symbolRepository = symbolRepository;
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
        var cacheKey = $"stock:candles:{normalised}:{from:yyyy-MM-dd}:{to:yyyy-MM-dd}";
        var cached = await _cache.GetAsync<Dictionary<string, decimal>>(cacheKey);
        if (cached is not null)
            return cached.ToDictionary(
                kvp => DateOnly.ParseExact(kvp.Key, "yyyy-MM-dd"),
                kvp => kvp.Value);

        var closes = await _finnhubClient.GetDailyClosesAsync(normalised, from, to);

        if (closes.Count > 0)
        {
            var serialisable = closes
                .ToDictionary(kvp => kvp.Key.ToString("yyyy-MM-dd"), kvp => kvp.Value);
            await _cache.SetAsync(cacheKey, serialisable, TimeSpan.FromHours(24));
        }

        return closes;
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
}
