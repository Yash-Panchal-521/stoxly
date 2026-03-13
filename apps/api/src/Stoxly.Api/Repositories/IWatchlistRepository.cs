using Stoxly.Api.Models;

namespace Stoxly.Api.Repositories;

public interface IWatchlistRepository
{
    Task<List<Watchlist>> GetUserWatchlistAsync(string userId);
    Task<int> GetWatchlistCountAsync(string userId);
    Task<bool> ExistsAsync(string userId, string ticker);
    Task<Watchlist> AddAsync(Watchlist watchlist);
    Task RemoveAsync(string userId, string ticker);
    Task<List<string>> GetAllDistinctTickersAsync();
}
