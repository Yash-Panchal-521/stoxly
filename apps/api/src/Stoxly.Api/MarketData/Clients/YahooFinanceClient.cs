using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace Stoxly.Api.MarketData.Clients;

public sealed class YahooFinanceClient : IYahooFinanceClient
{
    private const string BaseUrl = "https://query1.finance.yahoo.com/v8/finance/chart";
    private const int FallbackLookbackDays = 14;
    private const string DateFormat = "yyyy-MM-dd";

    private readonly HttpClient _httpClient;
    private readonly ILogger<YahooFinanceClient> _logger;

    public YahooFinanceClient(HttpClient httpClient, ILogger<YahooFinanceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<IReadOnlyDictionary<DateOnly, decimal>> GetDailyClosesAsync(
        string symbol, DateOnly from, DateOnly to)
    {
        var period1 = new DateTimeOffset(from.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero).ToUnixTimeSeconds();
        // Include the full end day by pointing to the start of the following day
        var period2 = new DateTimeOffset(to.AddDays(1).ToDateTime(TimeOnly.MinValue), TimeSpan.Zero)
            .ToUnixTimeSeconds() - 1;

        var url = $"{BaseUrl}/{Uri.EscapeDataString(symbol)}?interval=1d&period1={period1}&period2={period2}";

        _logger.LogInformation(
            "Fetching Yahoo Finance daily closes for {Symbol} from {From} to {To}",
            symbol, from.ToString(DateFormat), to.ToString(DateFormat));

        using var httpResponse = await _httpClient.GetAsync(url);

        if (!httpResponse.IsSuccessStatusCode)
        {
            _logger.LogWarning(
                "Yahoo Finance returned {StatusCode} for {Symbol}",
                (int)httpResponse.StatusCode, symbol);
            return new Dictionary<DateOnly, decimal>();
        }

        YahooChartResponse? response;
        try
        {
            response = await httpResponse.Content.ReadFromJsonAsync<YahooChartResponse>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deserialise Yahoo Finance response for {Symbol}", symbol);
            return new Dictionary<DateOnly, decimal>();
        }

        var chartResult = response?.Chart?.Result;
        if (chartResult is null || chartResult.Count == 0)
        {
            _logger.LogWarning("Yahoo Finance returned no chart data for {Symbol}", symbol);
            return new Dictionary<DateOnly, decimal>();
        }

        var result = chartResult[0];
        var timestamps = result.Timestamps;
        var closes = result.Indicators?.Quote?.FirstOrDefault()?.Close;

        if (timestamps is null || closes is null || timestamps.Count != closes.Count)
        {
            _logger.LogWarning(
                "Yahoo Finance returned mismatched or empty timestamps/closes for {Symbol}", symbol);
            return new Dictionary<DateOnly, decimal>();
        }

        var priceMap = new Dictionary<DateOnly, decimal>(timestamps.Count);
        for (var i = 0; i < timestamps.Count; i++)
        {
            if (closes[i] is null)
                continue;

            var date = DateOnly.FromDateTime(
                DateTimeOffset.FromUnixTimeSeconds(timestamps[i]).UtcDateTime);

            priceMap[date] = closes[i]!.Value;
        }

        _logger.LogInformation(
            "Yahoo Finance returned {Count} daily closes for {Symbol} in range [{From}, {To}]",
            priceMap.Count, symbol, from.ToString(DateFormat), to.ToString(DateFormat));

        return priceMap;
    }

    public async Task<decimal?> GetHistoricalPriceAsync(string symbol, DateOnly date)
    {
        // Look back up to FallbackLookbackDays to cover weekends and market holidays.
        var from = date.AddDays(-FallbackLookbackDays);
        var closes = await GetDailyClosesAsync(symbol, from, date);

        if (closes.Count == 0)
            return null;

        // Return price for exact date; if absent (weekend/holiday), fall back to the closest prior trading day.
        var bestDate = closes.Keys
            .Where(d => d <= date)
            .OrderByDescending(d => d)
            .FirstOrDefault();

        return bestDate == default ? null : closes[bestDate];
    }
}

// ── Internal Yahoo Finance response models ────────────────────────────────────

internal sealed class YahooChartResponse
{
    [JsonPropertyName("chart")] public YahooChartBody? Chart { get; init; }
}

internal sealed class YahooChartBody
{
    [JsonPropertyName("result")] public IReadOnlyList<YahooChartResult>? Result { get; init; }
    [JsonPropertyName("error")] public object? Error { get; init; }
}

internal sealed class YahooChartResult
{
    [JsonPropertyName("timestamp")] public IReadOnlyList<long>? Timestamps { get; init; }
    [JsonPropertyName("indicators")] public YahooIndicators? Indicators { get; init; }
}

internal sealed class YahooIndicators
{
    [JsonPropertyName("quote")] public IReadOnlyList<YahooQuote>? Quote { get; init; }
}

internal sealed class YahooQuote
{
    [JsonPropertyName("close")] public IReadOnlyList<decimal?>? Close { get; init; }
}
