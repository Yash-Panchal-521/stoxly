using Stoxly.Api.MarketData.DTOs;

namespace Stoxly.Api.MarketData.Interfaces;

public interface IMarketDataService
{
    /// <summary>Returns live price data for a single symbol, or null if not found.</summary>
    Task<StockPriceDto?> GetPriceAsync(string symbol);

    /// <summary>Returns live price data for multiple symbols. Symbols with no data are omitted.</summary>
    Task<IReadOnlyList<StockPriceDto>> GetPricesAsync(IEnumerable<string> symbols);

    /// <summary>
    /// Searches for stock symbols matching the given query string.
    /// Checks the local database first; calls the external API when fewer than 5 local results are found.
    /// </summary>
    Task<IReadOnlyList<SymbolSearchResultDto>> SearchSymbolsAsync(string query);
}
