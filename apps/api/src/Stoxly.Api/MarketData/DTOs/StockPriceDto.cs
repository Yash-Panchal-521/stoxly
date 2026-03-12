namespace Stoxly.Api.MarketData.DTOs;

public sealed record StockPriceDto(
    string Symbol,
    decimal CurrentPrice,
    decimal Change,
    decimal ChangePercent,
    decimal HighPrice,
    decimal LowPrice,
    decimal OpenPrice,
    decimal PreviousClose,
    DateTimeOffset Timestamp);
