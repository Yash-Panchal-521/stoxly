using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Stoxly.Api.DTOs;
using Stoxly.Api.Middleware;
using Stoxly.Api.Services;

namespace Stoxly.Api.Controllers;

[ApiController]
[Route("api")]
[FirebaseAuthorize]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetAllTransactions()
    {
        var userId = GetUserId();
        var transactions = await _transactionService.GetAllUserTransactionsAsync(userId);
        return Ok(transactions);
    }

    [HttpPost("portfolios/{portfolioId:guid}/transactions")]
    public async Task<IActionResult> CreateTransaction(Guid portfolioId, [FromBody] CreateTransactionRequest request)
    {
        var userId = GetUserId();
        var transaction = await _transactionService.CreateTransactionAsync(portfolioId, userId, request);
        return CreatedAtAction(nameof(GetTransactions), new { portfolioId }, transaction);
    }

    [HttpGet("portfolios/{portfolioId:guid}/transactions")]
    public async Task<IActionResult> GetTransactions(Guid portfolioId)
    {
        var userId = GetUserId();
        var transactions = await _transactionService.GetPortfolioTransactionsAsync(portfolioId, userId);
        return Ok(transactions);
    }

    [HttpPatch("transactions/{id:guid}")]
    public async Task<IActionResult> UpdateTransaction(Guid id, [FromBody] UpdateTransactionRequest request)
    {
        var userId = GetUserId();
        var transaction = await _transactionService.UpdateTransactionAsync(id, request.PortfolioId, userId, request);
        return Ok(transaction);
    }

    [HttpDelete("transactions/{id:guid}")]
    public async Task<IActionResult> DeleteTransaction(Guid id, [FromQuery] Guid portfolioId)
    {
        var userId = GetUserId();
        await _transactionService.DeleteTransactionAsync(id, portfolioId, userId);
        return NoContent();
    }

    private string GetUserId()
    {
        return User.FindFirstValue("firebase_uid")
            ?? throw new UnauthorizedAccessException("User identity not found.");
    }
}
