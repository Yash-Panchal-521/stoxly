using Stoxly.Api.MarketData.DTOs;

namespace Stoxly.Api.MarketData.Clients;

public interface IFinnhubClient
{
    /// <summary>Fetches a real-time quote for the given symbol. Returns null if the symbol is unknown.</summary>
    Task<StockPriceDto?> GetQuoteAsync(string symbol);

    /// <summary>Searches Finnhub for symbols matching the query string.</summary>
    Task<IReadOnlyList<StockSymbolDto>> SearchSymbolsAsync(string query);
}
