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
        using var response = await _httpClient.GetAsync(url);

        // Return null for any non-success status (403 for unsupported symbols on free tier, etc.)
        if (!response.IsSuccessStatusCode)
            return null;

        var quote = await response.Content.ReadFromJsonAsync<FinnhubQuoteResponse>();

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

    public async Task<IReadOnlyList<StockPriceDto>> GetBulkQuotesAsync(IEnumerable<string> symbols)
    {
        var tickers = symbols
            .Select(s => s.Trim().ToUpperInvariant())
            .Where(s => s.Length > 0)
            .Distinct()
            .ToList();

        if (tickers.Count == 0)
            return [];

        // Finnhub free tier allows ~30 req/s; limit concurrent calls to avoid 429s.
        using var semaphore = new SemaphoreSlim(10, 10);

        var tasks = tickers.Select(async ticker =>
        {
            await semaphore.WaitAsync();
            try { return await GetQuoteAsync(ticker); }
            finally { semaphore.Release(); }
        });

        var results = await Task.WhenAll(tasks);

        return results
            .OfType<StockPriceDto>()
            .ToList()
            .AsReadOnly();
    }

    public async Task<IReadOnlyList<StockSymbolDto>> SearchSymbolsAsync(string query)
    {
        var url = $"{_options.BaseUrl}/search?q={Uri.EscapeDataString(query)}&token={_options.ApiKey}";
        using var httpResponse = await _httpClient.GetAsync(url);

        if (!httpResponse.IsSuccessStatusCode)
            return [];

        var response = await httpResponse.Content.ReadFromJsonAsync<FinnhubSearchResponse>();

        if (response?.Result is null)
            return [];

        return response.Result
            .Select(s => new StockSymbolDto(s.Symbol, s.DisplaySymbol, s.Description, s.Type))
            .ToList()
            .AsReadOnly();
    }

    public async Task<IReadOnlyDictionary<DateOnly, decimal>> GetDailyClosesAsync(
        string symbol, DateOnly from, DateOnly to)
    {
        var fromTs = new DateTimeOffset(from.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero).ToUnixTimeSeconds();
        // Include the full end day by pointing to one second before midnight of the next day
        var toTs = new DateTimeOffset(to.AddDays(1).ToDateTime(TimeOnly.MinValue), TimeSpan.Zero)
            .ToUnixTimeSeconds() - 1;

        var url = $"{_options.BaseUrl}/stock/candle" +
                  $"?symbol={Uri.EscapeDataString(symbol)}&resolution=D" +
                  $"&from={fromTs}&to={toTs}&token={_options.ApiKey}";

        using var httpResponse = await _httpClient.GetAsync(url);
        if (!httpResponse.IsSuccessStatusCode)
            return new Dictionary<DateOnly, decimal>();

        var response = await httpResponse.Content.ReadFromJsonAsync<FinnhubCandleResponse>();

        if (response is null || response.Status != "ok"
            || response.ClosePrices is null || response.Timestamps is null)
            return new Dictionary<DateOnly, decimal>();

        var result = new Dictionary<DateOnly, decimal>(response.Timestamps.Count);
        for (var i = 0; i < response.Timestamps.Count; i++)
        {
            var date = DateOnly.FromDateTime(
                DateTimeOffset.FromUnixTimeSeconds(response.Timestamps[i]).UtcDateTime);
            result[date] = response.ClosePrices[i];
        }

        return result;
    }
}

// ── Internal Finnhub response models ─────────────────────────────────────────

internal sealed class FinnhubCandleResponse
{
    [JsonPropertyName("c")] public IReadOnlyList<decimal>? ClosePrices { get; init; }
    [JsonPropertyName("s")] public string Status { get; init; } = string.Empty;
    [JsonPropertyName("t")] public IReadOnlyList<long>? Timestamps { get; init; }
}

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
