using Stoxly.Api.DTOs;
using Stoxly.Api.MarketData.Interfaces;
using Stoxly.Api.Models;
using Stoxly.Api.Repositories;

namespace Stoxly.Api.Services;

public class WatchlistService : IWatchlistService
{
    private const int MaxWatchlistItems = 50;

    private readonly IWatchlistRepository _watchlistRepository;
    private readonly ISymbolRepository _symbolRepository;
    private readonly IMarketDataService _marketDataService;

    public WatchlistService(
        IWatchlistRepository watchlistRepository,
        ISymbolRepository symbolRepository,
        IMarketDataService marketDataService)
    {
        _watchlistRepository = watchlistRepository;
        _symbolRepository = symbolRepository;
        _marketDataService = marketDataService;
    }

    public async Task<List<WatchlistItemResponse>> GetWatchlistAsync(string userId)
    {
        var items = await _watchlistRepository.GetUserWatchlistAsync(userId);

        if (items.Count == 0)
            return [];

        var tickers = items.Select(w => w.Ticker).ToList();
        var prices = await _marketDataService.GetPricesAsync(tickers);
        var priceMap = prices.ToDictionary(p => p.Symbol, StringComparer.OrdinalIgnoreCase);

        return items.Select(w =>
        {
            priceMap.TryGetValue(w.Ticker, out var quote);
            return new WatchlistItemResponse
            {
                Symbol = w.Ticker,
                CompanyName = w.Symbol?.Name,
                Exchange = w.Symbol?.Exchange,
                CurrentPrice = quote?.CurrentPrice,
                Change = quote?.Change,
                ChangePercent = quote?.ChangePercent,
            };
        }).ToList();
    }

    public async Task<WatchlistItemResponse> AddToWatchlistAsync(string userId, AddWatchlistItemRequest request)
    {
        var ticker = request.Symbol.Trim().ToUpperInvariant();

        var symbol = await _symbolRepository.GetSymbolAsync(ticker)
            ?? throw new ArgumentException($"Symbol '{ticker}' is not recognised. Search for the stock first.");

        var count = await _watchlistRepository.GetWatchlistCountAsync(userId);
        if (count >= MaxWatchlistItems)
            throw new InvalidOperationException($"Watchlist cannot exceed {MaxWatchlistItems} items.");

        if (await _watchlistRepository.ExistsAsync(userId, ticker))
            throw new InvalidOperationException($"'{ticker}' is already on your watchlist.");

        var entry = new Watchlist
        {
            UserId = userId,
            Ticker = ticker,
        };

        await _watchlistRepository.AddAsync(entry);

        var prices = await _marketDataService.GetPricesAsync([ticker]);
        var quote = prices.FirstOrDefault();

        return new WatchlistItemResponse
        {
            Symbol = ticker,
            CompanyName = symbol.Name,
            Exchange = symbol.Exchange,
            CurrentPrice = quote?.CurrentPrice,
            Change = quote?.Change,
            ChangePercent = quote?.ChangePercent,
        };
    }

    public async Task RemoveFromWatchlistAsync(string userId, string symbol)
    {
        var ticker = symbol.Trim().ToUpperInvariant();
        await _watchlistRepository.RemoveAsync(userId, ticker);
    }
}
