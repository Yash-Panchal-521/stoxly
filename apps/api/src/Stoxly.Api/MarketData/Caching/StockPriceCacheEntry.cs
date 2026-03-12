namespace Stoxly.Api.MarketData.Caching;

internal sealed record StockPriceCacheEntry(
    decimal Price,
    decimal Change,
    decimal ChangePercent,
    DateTimeOffset UpdatedAt);
