using Microsoft.EntityFrameworkCore;
using Stoxly.Api.Data;
using Stoxly.Api.Models;

namespace Stoxly.Api.Repositories;

public class PortfolioRepository : IPortfolioRepository
{
    private readonly AppDbContext _db;

    public PortfolioRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Portfolio> CreatePortfolioAsync(Portfolio portfolio)
    {
        _db.Portfolios.Add(portfolio);
        await _db.SaveChangesAsync();
        return portfolio;
    }

    public async Task<List<Portfolio>> GetUserPortfoliosAsync(string userId)
    {
        return await _db.Portfolios
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.IsDefault)
            .ThenBy(p => p.Name)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Portfolio?> GetPortfolioByIdAsync(Guid id, string userId)
    {
        return await _db.Portfolios
            .Where(p => p.Id == id && p.UserId == userId)
            .FirstOrDefaultAsync();
    }

    public async Task<Portfolio> UpdatePortfolioAsync(Portfolio portfolio)
    {
        portfolio.UpdatedAt = DateTime.UtcNow;
        _db.Portfolios.Update(portfolio);
        await _db.SaveChangesAsync();
        return portfolio;
    }

    public async Task SoftDeletePortfolioAsync(Guid id, string userId)
    {
        var portfolio = await _db.Portfolios
            .Where(p => p.Id == id && p.UserId == userId)
            .FirstOrDefaultAsync();

        if (portfolio is null)
            throw new KeyNotFoundException($"Portfolio with id '{id}' not found.");

        portfolio.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<Portfolio?> GetSimulationPortfolioAsync(string userId)
    {
        return await _db.Portfolios
            .Where(p => p.UserId == userId && p.PortfolioType == PortfolioType.SIMULATION)
            .AsNoTracking()
            .FirstOrDefaultAsync();
    }
}
