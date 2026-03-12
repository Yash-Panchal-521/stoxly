namespace Stoxly.Api.Services;

/// <summary>
/// Placeholder implementation of <see cref="IMarketPriceService"/> that always returns an empty price set.
/// Replace with a real market data provider (e.g. Yahoo Finance, Finnhub) when ready.
/// </summary>
public class StubMarketPriceService : IMarketPriceService
{
    public Task<IReadOnlyDictionary<string, decimal>> GetPricesAsync(IEnumerable<string> symbols)
    {
        return Task.FromResult<IReadOnlyDictionary<string, decimal>>(
            new Dictionary<string, decimal>());
    }
}
