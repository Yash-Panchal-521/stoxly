namespace Stoxly.Api.MarketData.DTOs;

/// <summary>Closing price for a stock symbol on a specific trading date.</summary>
public sealed record StockHistoricalPriceDto(
    string Symbol,
    string Date,
    decimal Price);
