using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Stoxly.Api.DTOs;
using Stoxly.Api.Middleware;
using Stoxly.Api.Services;

namespace Stoxly.Api.Controllers;

[ApiController]
[Route("api/portfolios")]
[FirebaseAuthorize]
public class PortfolioController : ControllerBase
{
    private readonly IPortfolioService _portfolioService;
    private readonly IHoldingsService _holdingsService;
    private readonly IPortfolioPerformanceService _performanceService;
    private readonly IPortfolioMetricsService _metricsService;

    public PortfolioController(
        IPortfolioService portfolioService,
        IHoldingsService holdingsService,
        IPortfolioPerformanceService performanceService,
        IPortfolioMetricsService metricsService)
    {
        _portfolioService = portfolioService;
        _holdingsService = holdingsService;
        _performanceService = performanceService;
        _metricsService = metricsService;
    }

    [HttpPost]
    public async Task<IActionResult> CreatePortfolio([FromBody] CreatePortfolioRequest request)
    {
        var userId = GetUserId();
        var portfolio = await _portfolioService.CreatePortfolioAsync(userId, request);
        return CreatedAtAction(nameof(GetPortfolio), new { id = portfolio.Id }, portfolio);
    }

    [HttpGet]
    public async Task<IActionResult> GetPortfolios()
    {
        var userId = GetUserId();
        var portfolios = await _portfolioService.GetUserPortfoliosAsync(userId);
        return Ok(portfolios);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPortfolio(Guid id)
    {
        var userId = GetUserId();
        var portfolio = await _portfolioService.GetPortfolioAsync(id, userId);
        return Ok(portfolio);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdatePortfolio(Guid id, [FromBody] UpdatePortfolioRequest request)
    {
        var userId = GetUserId();
        var portfolio = await _portfolioService.UpdatePortfolioAsync(id, userId, request);
        return Ok(portfolio);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePortfolio(Guid id)
    {
        var userId = GetUserId();
        await _portfolioService.DeletePortfolioAsync(id, userId);
        return NoContent();
    }

    [HttpGet("{portfolioId:guid}/holdings")]
    public async Task<IActionResult> GetHoldings(Guid portfolioId)
    {
        var userId = GetUserId();
        var holdings = await _holdingsService.GetHoldingsAsync(portfolioId, userId);
        return Ok(holdings);
    }

    /// <summary>
    /// Returns live portfolio metrics: total value, invested capital, realized and unrealized profit.
    /// Prices are fetched from Redis (60 s TTL) with a Finnhub fallback.
    /// </summary>
    [HttpGet("{portfolioId:guid}/metrics")]
    public async Task<IActionResult> GetMetrics(Guid portfolioId)
    {
        var userId = GetUserId();
        try
        {
            var metrics = await _metricsService.GetMetricsAsync(portfolioId, userId);
            return Ok(metrics);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// Returns daily portfolio value snapshots from the first transaction date to today.
    /// Uses Finnhub historical candle data (fill-forwarded across weekends/holidays).
    /// </summary>
    [HttpGet("{portfolioId:guid}/performance")]
    public async Task<IActionResult> GetPerformance(Guid portfolioId)
    {
        var userId = GetUserId();
        var dataPoints = await _performanceService.GetPerformanceAsync(portfolioId, userId);
        return Ok(dataPoints);
    }

    private string GetUserId()
    {
        return User.FindFirstValue("firebase_uid")
            ?? throw new UnauthorizedAccessException("User identity not found.");
    }
}
