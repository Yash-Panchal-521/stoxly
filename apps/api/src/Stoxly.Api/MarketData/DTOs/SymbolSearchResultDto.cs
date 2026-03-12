namespace Stoxly.Api.MarketData.DTOs;

public sealed record SymbolSearchResultDto(
    string Symbol,
    string Name,
    string Exchange);
