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
            .Where(t => t.PortfolioId == portfolioId)
            .OrderByDescending(t => t.TradeDate)
            .ThenByDescending(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
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
}
