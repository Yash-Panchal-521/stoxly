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
        {
            return new StockPriceDto(
                normalised,
                cached.Price,
                cached.Change,
                cached.ChangePercent,
                HighPrice: 0m,
                LowPrice: 0m,
                OpenPrice: 0m,
                PreviousClose: 0m,
                cached.UpdatedAt);
        }

        var price = await _finnhubClient.GetQuoteAsync(normalised);
        if (price is not null)
        {
            var entry = new StockPriceCacheEntry(
                price.CurrentPrice,
                price.Change,
                price.ChangePercent,
                price.Timestamp);

            await _cache.SetAsync(key, entry, PriceCacheTtl);
        }

        return price;
    }

    public async Task<IReadOnlyList<StockPriceDto>> GetPricesAsync(IEnumerable<string> symbols)
    {
        var distinct = symbols
            .Select(s => s.Trim().ToUpperInvariant())
            .Where(s => !string.IsNullOrEmpty(s))
            .Distinct()
            .ToList();

        var tasks = distinct.Select(GetPriceAsync);
        var results = await Task.WhenAll(tasks);

        return results.Where(p => p is not null).Cast<StockPriceDto>().ToList().AsReadOnly();
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
