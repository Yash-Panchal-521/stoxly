using Microsoft.EntityFrameworkCore;
using Stoxly.Api.Data;
using Stoxly.Api.Models;

namespace Stoxly.Api.Repositories;

public class WatchlistRepository : IWatchlistRepository
{
    private readonly AppDbContext _db;

    public WatchlistRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Watchlist>> GetUserWatchlistAsync(string userId)
    {
        return await _db.Watchlists
            .Where(w => w.UserId == userId)
            .Include(w => w.Symbol)
            .OrderBy(w => w.Ticker)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<int> GetWatchlistCountAsync(string userId)
    {
        return await _db.Watchlists
            .CountAsync(w => w.UserId == userId);
    }

    public async Task<bool> ExistsAsync(string userId, string ticker)
    {
        return await _db.Watchlists
            .AnyAsync(w => w.UserId == userId && w.Ticker == ticker);
    }

    public async Task<Watchlist> AddAsync(Watchlist watchlist)
    {
        _db.Watchlists.Add(watchlist);
        await _db.SaveChangesAsync();
        return watchlist;
    }

    public async Task RemoveAsync(string userId, string ticker)
    {
        var entry = await _db.Watchlists
            .FirstOrDefaultAsync(w => w.UserId == userId && w.Ticker == ticker);

        if (entry is null)
            throw new KeyNotFoundException($"Watchlist item '{ticker}' not found.");

        _db.Watchlists.Remove(entry);
        await _db.SaveChangesAsync();
    }

    public async Task<List<string>> GetAllDistinctTickersAsync()
    {
        return await _db.Watchlists
            .Select(w => w.Ticker)
            .Distinct()
            .ToListAsync();
    }
}
