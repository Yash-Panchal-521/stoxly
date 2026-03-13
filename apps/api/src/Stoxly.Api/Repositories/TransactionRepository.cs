using Microsoft.EntityFrameworkCore;
using Stoxly.Api.Data;
using Stoxly.Api.Models;

namespace Stoxly.Api.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly AppDbContext _db;

    public TransactionRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Transaction> CreateTransactionAsync(Transaction transaction)
    {
        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync();
        return transaction;
    }

    public async Task<List<Transaction>> GetPortfolioTransactionsAsync(Guid portfolioId)
    {
        return await _db.Transactions
            .Where(t => t.PortfolioId == portfolioId && t.DeletedAt == null)
            .OrderByDescending(t => t.TradeDate)
            .ThenByDescending(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<TransactionWithPortfolioDto>> GetAllUserTransactionsAsync(string userId)
    {
        var results = await (
            from t in _db.Transactions
            join p in _db.Portfolios on t.PortfolioId equals p.Id
            where p.UserId == userId && t.DeletedAt == null && p.DeletedAt == null
            orderby t.TradeDate descending, t.CreatedAt descending
            select new { Transaction = t, PortfolioName = p.Name }
        ).AsNoTracking().ToListAsync();

        return results.Select(x => new TransactionWithPortfolioDto(x.Transaction, x.PortfolioName)).ToList();
    }

    public async Task<Transaction?> GetTransactionByIdAsync(Guid id, Guid portfolioId)
    {
        return await _db.Transactions
            .Where(t => t.Id == id && t.PortfolioId == portfolioId)
            .FirstOrDefaultAsync();
    }

    public async Task<Transaction> UpdateTransactionAsync(Transaction transaction)
    {
        transaction.UpdatedAt = DateTime.UtcNow;
        _db.Transactions.Update(transaction);
        await _db.SaveChangesAsync();
        return transaction;
    }

    public async Task SoftDeleteTransactionAsync(Guid id, Guid portfolioId)
    {
        var transaction = await _db.Transactions
            .Where(t => t.Id == id && t.PortfolioId == portfolioId)
            .FirstOrDefaultAsync();

        if (transaction is null)
            throw new KeyNotFoundException($"Transaction with id '{id}' not found.");

        transaction.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task SoftDeleteAllByPortfolioAsync(Guid portfolioId)
    {
        var now = DateTime.UtcNow;
        await _db.Transactions
            .Where(t => t.PortfolioId == portfolioId && t.DeletedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.DeletedAt, now));
    }
}
