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

    public PortfolioController(IPortfolioService portfolioService, IHoldingsService holdingsService)
    {
        _portfolioService = portfolioService;
        _holdingsService = holdingsService;
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

    private string GetUserId()
    {
        return User.FindFirstValue("firebase_uid")
            ?? throw new UnauthorizedAccessException("User identity not found.");
    }
}
