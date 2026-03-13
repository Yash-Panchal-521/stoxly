using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Stoxly.Api.DTOs;
using Stoxly.Api.Middleware;
using Stoxly.Api.Services;

namespace Stoxly.Api.Controllers;

[ApiController]
[Route("api/simulation")]
[FirebaseAuthorize]
public class SimulationController : ControllerBase
{
    private readonly IPortfolioService _portfolioService;
    private readonly ISimulationPortfolioService _simulationPortfolioService;
    private readonly ISimulationTradeService _simulationTradeService;

    public SimulationController(
        IPortfolioService portfolioService,
        ISimulationPortfolioService simulationPortfolioService,
        ISimulationTradeService simulationTradeService)
    {
        _portfolioService = portfolioService;
        _simulationPortfolioService = simulationPortfolioService;
        _simulationTradeService = simulationTradeService;
    }

    /// <summary>
    /// Returns the authenticated user's simulation portfolio including cash balance.
    /// </summary>
    [HttpGet("portfolio")]
    public async Task<IActionResult> GetSimulationPortfolio()
    {
        var userId = GetUserId();
        var portfolio = await _portfolioService.GetSimulationPortfolioAsync(userId);

        if (portfolio is null)
            return NotFound("No simulation portfolio found.");

        return Ok(portfolio);
    }

    /// <summary>
    /// Creates a new simulation portfolio with a virtual cash balance.
    /// </summary>
    [HttpPost("portfolio")]
    public async Task<IActionResult> CreateSimulationPortfolio(
        [FromBody] CreateSimulationPortfolioRequest request)
    {
        var userId = GetUserId();
        var portfolio = await _portfolioService.CreateSimulationPortfolioAsync(userId, request);
        return CreatedAtAction(nameof(CreateSimulationPortfolio), new { id = portfolio.Id }, portfolio);
    }

    /// <summary>
    /// Resets the authenticated user's simulation portfolio to its starting state.
    /// Soft-deletes all transactions and restores the cash balance to the original starting cash.
    /// </summary>
    [HttpPost("reset")]
    public async Task<IActionResult> ResetSimulationPortfolio()
    {
        var userId = GetUserId();
        var portfolio = await _simulationPortfolioService.ResetAsync(userId);
        return Ok(portfolio);
    }

    /// <summary>
    /// Executes a market buy order at the current price using virtual cash.
    /// </summary>
    [HttpPost("buy")]
    public async Task<IActionResult> Buy([FromBody] SimulationBuyRequest request)
    {
        var userId = GetUserId();
        var result = await _simulationTradeService.ExecuteBuyAsync(
            request.PortfolioId,
            userId,
            request.Symbol,
            request.Quantity,
            request.Notes);
        return CreatedAtAction(nameof(Buy), result);
    }

    /// <summary>
    /// Executes a market sell order at the current price, freeing virtual cash.
    /// </summary>
    [HttpPost("sell")]
    public async Task<IActionResult> Sell([FromBody] SimulationSellRequest request)
    {
        var userId = GetUserId();
        var result = await _simulationTradeService.ExecuteSellAsync(
            request.PortfolioId,
            userId,
            request.Symbol,
            request.Quantity,
            request.Notes);
        return CreatedAtAction(nameof(Sell), result);
    }

    /// <summary>
    /// Updates the note on a simulation trade. Accepts null or empty string to clear the note.
    /// </summary>
    [HttpPatch("trades/{transactionId:guid}/notes")]
    public async Task<IActionResult> UpdateTradeNotes(
        Guid transactionId,
        [FromBody] UpdateTradeNotesRequest request)
    {
        var userId = GetUserId();
        await _simulationTradeService.UpdateTradeNotesAsync(transactionId, userId, request.Notes);
        return NoContent();
    }

    private string GetUserId()
    {
        return User.FindFirstValue("firebase_uid")
            ?? throw new UnauthorizedAccessException("User identity not found.");
    }
}
