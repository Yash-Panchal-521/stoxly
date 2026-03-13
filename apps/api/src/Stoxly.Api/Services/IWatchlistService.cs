using Stoxly.Api.DTOs;

namespace Stoxly.Api.Services;

public interface IWatchlistService
{
    Task<List<WatchlistItemResponse>> GetWatchlistAsync(string userId);
    Task<WatchlistItemResponse> AddToWatchlistAsync(string userId, AddWatchlistItemRequest request);
    Task RemoveFromWatchlistAsync(string userId, string symbol);
}
