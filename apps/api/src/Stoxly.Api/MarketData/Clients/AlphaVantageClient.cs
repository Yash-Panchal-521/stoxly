using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Stoxly.Api.MarketData.Clients;

public sealed class AlphaVantageOptions
{
    public const string SectionName = "AlphaVantage";

    public string ApiKey { get; init; } = string.Empty;
    public string BaseUrl { get; init; } = "https://www.alphavantage.co";
}

public sealed class AlphaVantageClient : IAlphaVantageClient
{
    private const string DateFormat = "yyyy-MM-dd";
    private readonly HttpClient _httpClient;
    private readonly AlphaVantageOptions _options;
    private readonly ILogger<AlphaVantageClient> _logger;

    public AlphaVantageClient(
        HttpClient httpClient,
        IOptions<AlphaVantageOptions> options,
        ILogger<AlphaVantageClient> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<IReadOnlyDictionary<DateOnly, decimal>> GetDailyClosesAsync(
        string symbol, DateOnly from, DateOnly to)
    {
        var url = $"{_options.BaseUrl}/query" +
                  $"?function=TIME_SERIES_DAILY" +
                  $"&symbol={Uri.EscapeDataString(symbol)}" +
                  $"&outputsize=full" +
                  $"&apikey={_options.ApiKey}";

        _logger.LogInformation(
            "Fetching Alpha Vantage daily closes for {Symbol} from {From} to {To}",
            symbol, from.ToString(DateFormat), to.ToString(DateFormat));

        using var httpResponse = await _httpClient.GetAsync(url);

        if (!httpResponse.IsSuccessStatusCode)
        {
            _logger.LogWarning(
                "Alpha Vantage returned {StatusCode} for {Symbol}",
                (int)httpResponse.StatusCode, symbol);
            return new Dictionary<DateOnly, decimal>();
        }

        AlphaVantageTimeSeriesResponse? response;
        try
        {
            response = await httpResponse.Content.ReadFromJsonAsync<AlphaVantageTimeSeriesResponse>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deserialise Alpha Vantage response for {Symbol}", symbol);
            return new Dictionary<DateOnly, decimal>();
        }

        var series = response?.TimeSeries;
        if (series is null || series.Count == 0)
        {
            // Alpha Vantage returns a JSON object with a "Note" or "Information" key when
            // the rate limit is hit or the symbol is invalid instead of returning an error status.
            _logger.LogWarning(
                "Alpha Vantage returned no time series data for {Symbol}. " +
                "This may indicate an invalid symbol or a rate-limit response.", symbol);
            return new Dictionary<DateOnly, decimal>();
        }

        var result = new Dictionary<DateOnly, decimal>();

        foreach (var (dateStr, daily) in series)
        {
            if (!DateOnly.TryParseExact(
                    dateStr, DateFormat,
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.None,
                    out var date))
                continue;

            if (date < from || date > to)
                continue;

            if (decimal.TryParse(
                    daily.Close,
                    System.Globalization.NumberStyles.Number,
                    System.Globalization.CultureInfo.InvariantCulture,
                    out var close))
            {
                result[date] = close;
            }
        }

        _logger.LogInformation(
            "Alpha Vantage returned {Count} daily closes for {Symbol} in range [{From}, {To}]",
            result.Count, symbol, from.ToString(DateFormat), to.ToString(DateFormat));

        return result;
    }
}

// ── Internal Alpha Vantage response models ─────────────────────────────────────

internal sealed class AlphaVantageTimeSeriesResponse
{
    [JsonPropertyName("Time Series (Daily)")]
    public IReadOnlyDictionary<string, AlphaVantageDailyBar>? TimeSeries { get; init; }
}

internal sealed class AlphaVantageDailyBar
{
    [JsonPropertyName("4. close")] public string Close { get; init; } = string.Empty;
}
