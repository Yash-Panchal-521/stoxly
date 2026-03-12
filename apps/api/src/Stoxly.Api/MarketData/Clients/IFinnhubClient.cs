using Stoxly.Api.MarketData.DTOs;

namespace Stoxly.Api.MarketData.Clients;

public interface IFinnhubClient
{
    /// <summary>Fetches a real-time quote for the given symbol. Returns null if the symbol is unknown.</summary>
    Task<StockPriceDto?> GetQuoteAsync(string symbol);

    /// <summary>
    /// Fetches real-time quotes for multiple symbols concurrently.
    /// Symbols for which Finnhub returns no data are omitted from the result.
    /// </summary>
    Task<IReadOnlyList<StockPriceDto>> GetBulkQuotesAsync(IEnumerable<string> symbols);

    /// <summary>Searches Finnhub for symbols matching the query string.</summary>
    Task<IReadOnlyList<StockSymbolDto>> SearchSymbolsAsync(string query);

    /// <summary>
    /// Returns daily closing prices for a symbol between two dates (inclusive).
    /// Weekends and holidays are naturally absent from the result.
    /// Returns an empty dictionary if the symbol is unknown or the range has no data.
    /// </summary>
    Task<IReadOnlyDictionary<DateOnly, decimal>> GetDailyClosesAsync(string symbol, DateOnly from, DateOnly to);
}
