using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Stoxly.Api.MarketData.DTOs;
using Stoxly.Api.MarketData.Interfaces;

namespace Stoxly.Api.Controllers;

[ApiController]
[Route("api/market")]
public sealed class MarketController : ControllerBase
{
    private const int QueryMinLength = 1;
    private const int QueryMaxLength = 50;
    private static readonly Regex SafeQueryPattern = new(@"^[\p{L}\p{N}\s.\-]+$", RegexOptions.Compiled);

    private readonly IMarketDataService _marketDataService;

    public MarketController(IMarketDataService marketDataService)
    {
        _marketDataService = marketDataService;
    }

    /// <summary>Searches for stock symbols matching the given query.</summary>
    [HttpGet("search")]
    [EnableRateLimiting(RateLimitPolicies.MarketSearch)]
    public async Task<IActionResult> SearchSymbols([FromQuery(Name = "q")] string? query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest(new { error = "Query parameter 'q' is required." });

        var q = query.Trim();

        if (q.Length < QueryMinLength || q.Length > QueryMaxLength)
            return BadRequest(new { error = $"Query must be between {QueryMinLength} and {QueryMaxLength} characters." });

        if (!SafeQueryPattern.IsMatch(q))
            return BadRequest(new { error = "Query contains invalid characters." });

        var results = await _marketDataService.SearchSymbolsAsync(q);
        return Ok(results);
    }

    /// <summary>Returns the current price for a single stock symbol.</summary>
    [HttpGet("price/{symbol}")]
    public async Task<IActionResult> GetPrice(string symbol)
    {
        var price = await _marketDataService.GetPriceAsync(symbol.Trim().ToUpperInvariant());
        if (price is null)
            return NotFound(new { error = $"No price data available for symbol '{symbol.ToUpperInvariant()}'." });

        return Ok(price);
    }

    /// <summary>Returns the closing price for a symbol on a specific historical date (YYYY-MM-DD).</summary>
    [HttpGet("historical-price")]
    public async Task<IActionResult> GetHistoricalPrice(
        [FromQuery] string? symbol,
        [FromQuery] string? date)
    {
        if (string.IsNullOrWhiteSpace(symbol))
            return BadRequest(new { error = "Query parameter 'symbol' is required." });

        var sym = symbol.Trim().ToUpperInvariant();

        if (!SafeQueryPattern.IsMatch(sym))
            return BadRequest(new { error = "Symbol contains invalid characters." });

        if (string.IsNullOrWhiteSpace(date))
            return BadRequest(new { error = "Query parameter 'date' is required." });

        if (!DateOnly.TryParseExact(date.Trim(), "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var requestedDate))
            return BadRequest(new { error = "Parameter 'date' must be in YYYY-MM-DD format." });

        if (requestedDate > DateOnly.FromDateTime(DateTime.UtcNow))
            return BadRequest(new { error = "Cannot request a price for a future date." });

        var result = await _marketDataService.GetHistoricalPriceAsync(sym, requestedDate);

        if (result is null)
            return NotFound(new { error = $"No price data available for '{sym}' on {date}." });

        return Ok(result);
    }

    /// <summary>Returns current prices for multiple stock symbols supplied in the request body.</summary>
    [HttpPost("prices")]
    public async Task<IActionResult> GetPrices([FromBody] GetPricesRequest request)
    {
        if (request.Symbols is null || request.Symbols.Count == 0)
            return BadRequest(new { error = "At least one symbol is required." });

        var prices = await _marketDataService.GetPricesAsync(request.Symbols);
        return Ok(prices);
    }
}

public sealed record GetPricesRequest(IReadOnlyList<string> Symbols);
