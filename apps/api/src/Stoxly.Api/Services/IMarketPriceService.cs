namespace Stoxly.Api.Services;

/// <summary>
/// Provides current market prices for one or more stock symbols.
/// Replace <see cref="StubMarketPriceService"/> with a real implementation once a market data provider is integrated.
/// </summary>
public interface IMarketPriceService
{
    /// <summary>
    /// Returns the latest prices for the requested symbols.
    /// Symbols with no available price are omitted from the result.
    /// </summary>
    Task<IReadOnlyDictionary<string, decimal>> GetPricesAsync(IEnumerable<string> symbols);
}
