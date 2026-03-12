namespace Stoxly.Api.MarketData.DTOs;

public sealed record StockSymbolDto(
    string Symbol,
    string DisplaySymbol,
    string Description,
    string Type);
