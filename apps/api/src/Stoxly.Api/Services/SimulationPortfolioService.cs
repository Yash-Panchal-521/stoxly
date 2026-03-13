using Microsoft.EntityFrameworkCore;
using Stoxly.Api.Data;
using Stoxly.Api.DTOs;
using Stoxly.Api.Models;
using Stoxly.Api.Repositories;

namespace Stoxly.Api.Services;

public class SimulationPortfolioService : ISimulationPortfolioService
{
    private readonly AppDbContext _db;
    private readonly ITransactionRepository _transactionRepository;

    public SimulationPortfolioService(AppDbContext db, ITransactionRepository transactionRepository)
    {
        _db = db;
        _transactionRepository = transactionRepository;
    }

    public async Task<SimulationPortfolioResponse> ResetAsync(string userId)
    {
        var portfolio = await _db.Portfolios
            .Where(p => p.UserId == userId && p.PortfolioType == PortfolioType.SIMULATION)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("No simulation portfolio found.");

        if (portfolio.PortfolioType != PortfolioType.SIMULATION)
            throw new InvalidOperationException("Reset is only available for simulation portfolios.");

        await using var dbTransaction = await _db.Database.BeginTransactionAsync();
        try
        {
            await _transactionRepository.SoftDeleteAllByPortfolioAsync(portfolio.Id);

            portfolio.CashBalance = portfolio.StartingCash;
            portfolio.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await dbTransaction.CommitAsync();
        }
        catch
        {
            await dbTransaction.RollbackAsync();
            throw;
        }

        return new SimulationPortfolioResponse
        {
            Id = portfolio.Id,
            Name = portfolio.Name,
            StartingCash = portfolio.StartingCash ?? 0,
            CashBalance = portfolio.CashBalance ?? 0,
            PortfolioType = portfolio.PortfolioType.ToString(),
            CreatedAt = portfolio.CreatedAt,
        };
    }
}
