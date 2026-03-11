using Stoxly.Api.Models;

namespace Stoxly.Api.Repositories;

public interface ITransactionRepository
{
    Task<Transaction> CreateTransactionAsync(Transaction transaction);
    Task<List<Transaction>> GetPortfolioTransactionsAsync(Guid portfolioId);
    Task<Transaction?> GetTransactionByIdAsync(Guid id, Guid portfolioId);
    Task<Transaction> UpdateTransactionAsync(Transaction transaction);
    Task SoftDeleteTransactionAsync(Guid id, Guid portfolioId);
}
