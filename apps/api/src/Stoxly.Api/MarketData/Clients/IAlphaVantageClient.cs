namespace Stoxly.Api.MarketData.Clients;

public interface IAlphaVantageClient
{
    /// <summary>
    /// Returns daily closing prices for a symbol between two dates (inclusive).
    /// Weekends and holidays are naturally absent from the result.
    /// Returns an empty dictionary if the symbol is unknown, the range has no data,
    /// or the API call fails.
    /// </summary>
    Task<IReadOnlyDictionary<DateOnly, decimal>> GetDailyClosesAsync(string symbol, DateOnly from, DateOnly to);
}
