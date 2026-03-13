using Stoxly.Api.DTOs;

namespace Stoxly.Api.Services;

public interface ITransactionService
{
    Task<TransactionResponse> CreateTransactionAsync(Guid portfolioId, string userId, CreateTransactionRequest request);
    Task<List<TransactionResponse>> GetPortfolioTransactionsAsync(Guid portfolioId, string userId);
    Task<List<TransactionResponse>> GetAllUserTransactionsAsync(string userId);
    Task<TransactionResponse> UpdateTransactionAsync(Guid id, Guid portfolioId, string userId, UpdateTransactionRequest request);
    Task DeleteTransactionAsync(Guid id, Guid portfolioId, string userId);
}
