namespace Stoxly.Api.MarketData.Caching;

internal sealed record StockPriceCacheEntry(
    decimal Price,
    decimal Change,
    decimal ChangePercent,
    decimal HighPrice,
    decimal LowPrice,
    decimal OpenPrice,
    decimal PreviousClose,
    DateTimeOffset UpdatedAt);
