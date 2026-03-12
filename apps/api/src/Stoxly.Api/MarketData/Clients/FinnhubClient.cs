using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using Stoxly.Api.MarketData.DTOs;

namespace Stoxly.Api.MarketData.Clients;

public sealed class FinnhubOptions
{
    public const string SectionName = "Finnhub";

    public string ApiKey { get; init; } = string.Empty;
    public string BaseUrl { get; init; } = "https://finnhub.io/api/v1";
}

public sealed class FinnhubClient : IFinnhubClient
{
    private readonly HttpClient _httpClient;
    private readonly FinnhubOptions _options;

    public FinnhubClient(HttpClient httpClient, IOptions<FinnhubOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<StockPriceDto?> GetQuoteAsync(string symbol)
    {
        var url = $"{_options.BaseUrl}/quote?symbol={Uri.EscapeDataString(symbol)}&token={_options.ApiKey}";
        var quote = await _httpClient.GetFromJsonAsync<FinnhubQuoteResponse>(url);

        // Finnhub returns all-zero values for unknown symbols
        if (quote is null || quote.CurrentPrice == 0)
            return null;

        return new StockPriceDto(
            symbol.ToUpperInvariant(),
            quote.CurrentPrice,
            quote.Change ?? 0m,
            quote.ChangePercent ?? 0m,
            quote.HighPrice,
            quote.LowPrice,
            quote.OpenPrice,
            quote.PreviousClose,
            DateTimeOffset.FromUnixTimeSeconds(quote.Timestamp));
    }

    public async Task<IReadOnlyList<StockSymbolDto>> SearchSymbolsAsync(string query)
    {
        var url = $"{_options.BaseUrl}/search?q={Uri.EscapeDataString(query)}&token={_options.ApiKey}";
        var response = await _httpClient.GetFromJsonAsync<FinnhubSearchResponse>(url);

        if (response?.Result is null)
            return [];

        return response.Result
            .Select(s => new StockSymbolDto(s.Symbol, s.DisplaySymbol, s.Description, s.Type))
            .ToList()
            .AsReadOnly();
    }
}

// ── Internal Finnhub response models ─────────────────────────────────────────

internal sealed class FinnhubQuoteResponse
{
    [JsonPropertyName("c")] public decimal CurrentPrice { get; init; }
    [JsonPropertyName("d")] public decimal? Change { get; init; }
    [JsonPropertyName("dp")] public decimal? ChangePercent { get; init; }
    [JsonPropertyName("h")] public decimal HighPrice { get; init; }
    [JsonPropertyName("l")] public decimal LowPrice { get; init; }
    [JsonPropertyName("o")] public decimal OpenPrice { get; init; }
    [JsonPropertyName("pc")] public decimal PreviousClose { get; init; }
    [JsonPropertyName("t")] public long Timestamp { get; init; }
}

internal sealed class FinnhubSearchResponse
{
    [JsonPropertyName("count")] public int Count { get; init; }
    [JsonPropertyName("result")] public IReadOnlyList<FinnhubSymbolResult> Result { get; init; } = [];
}

internal sealed class FinnhubSymbolResult
{
    [JsonPropertyName("description")] public string Description { get; init; } = string.Empty;
    [JsonPropertyName("displaySymbol")] public string DisplaySymbol { get; init; } = string.Empty;
    [JsonPropertyName("symbol")] public string Symbol { get; init; } = string.Empty;
    [JsonPropertyName("type")] public string Type { get; init; } = string.Empty;
}
