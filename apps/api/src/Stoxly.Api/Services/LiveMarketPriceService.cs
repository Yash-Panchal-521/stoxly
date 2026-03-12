using Stoxly.Api.MarketData.Interfaces;

namespace Stoxly.Api.Services;

/// <summary>
/// Production implementation of <see cref="IMarketPriceService"/> that delegates to
/// <see cref="IMarketDataService"/> (Redis-first, Finnhub fallback).
/// </summary>
public sealed class LiveMarketPriceService : IMarketPriceService
{
    private readonly IMarketDataService _marketDataService;
    private readonly ILogger<LiveMarketPriceService> _logger;

    public LiveMarketPriceService(
        IMarketDataService marketDataService,
        ILogger<LiveMarketPriceService> logger)
    {
        _marketDataService = marketDataService;
        _logger = logger;
    }

    public async Task<IReadOnlyDictionary<string, decimal>> GetPricesAsync(IEnumerable<string> symbols)
    {
        var symbolList = symbols
            .Select(s => s.Trim().ToUpperInvariant())
            .Where(s => !string.IsNullOrEmpty(s))
            .Distinct()
            .ToList();

        if (symbolList.Count == 0)
            return new Dictionary<string, decimal>();

        try
        {
            var prices = await _marketDataService.GetPricesAsync(symbolList);

            return prices.ToDictionary(
                dto => dto.Symbol,
                dto => dto.CurrentPrice,
                StringComparer.OrdinalIgnoreCase);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch live prices for symbols: {Symbols}", string.Join(", ", symbolList));
            return new Dictionary<string, decimal>();
        }
    }
}
