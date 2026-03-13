using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Stoxly.Api.DTOs;
using Stoxly.Api.Middleware;
using Stoxly.Api.Services;

namespace Stoxly.Api.Controllers;

[ApiController]
[Route("api/watchlist")]
[FirebaseAuthorize]
public class WatchlistController : ControllerBase
{
    private readonly IWatchlistService _watchlistService;

    public WatchlistController(IWatchlistService watchlistService)
    {
        _watchlistService = watchlistService;
    }

    [HttpGet]
    public async Task<IActionResult> GetWatchlist()
    {
        var userId = GetUserId();
        var items = await _watchlistService.GetWatchlistAsync(userId);
        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> AddToWatchlist([FromBody] AddWatchlistItemRequest request)
    {
        var userId = GetUserId();
        try
        {
            var item = await _watchlistService.AddToWatchlistAsync(userId, request);
            return Ok(item);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{symbol}")]
    public async Task<IActionResult> RemoveFromWatchlist(string symbol)
    {
        var userId = GetUserId();
        try
        {
            await _watchlistService.RemoveFromWatchlistAsync(userId, symbol);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    private string GetUserId()
    {
        return User.FindFirstValue("firebase_uid")
            ?? throw new UnauthorizedAccessException("User identity not found.");
    }
}
