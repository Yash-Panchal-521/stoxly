using Stoxly.Api.MarketData.DTOs;

namespace Stoxly.Api.MarketData.Clients;

public interface IYahooFinanceClient
{
    /// <summary>
    /// Returns daily closing prices for a symbol between two dates (inclusive).
    /// Weekends and holidays are naturally absent from the result.
    /// Returns an empty dictionary if the symbol is unknown, the range has no data,
    /// or the API call fails.
    /// </summary>
    Task<IReadOnlyDictionary<DateOnly, decimal>> GetDailyClosesAsync(string symbol, DateOnly from, DateOnly to);

    /// <summary>
    /// Returns the closing price for a symbol on the requested date.
    /// If the date falls on a weekend or holiday, returns the price for the closest
    /// prior trading day. Returns null if no data is available.
    /// </summary>
    Task<decimal?> GetHistoricalPriceAsync(string symbol, DateOnly date);

    /// <summary>
    /// Returns hourly close prices for a symbol between two UTC timestamps (inclusive).
    /// Returns an empty list if the symbol is unknown, the range has no data, or the API call fails.
    /// </summary>
    Task<IReadOnlyList<IntradayPointDto>> GetHourlyClosesAsync(string symbol, DateTimeOffset from, DateTimeOffset to);
}
