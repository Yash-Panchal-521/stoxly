using Stoxly.Api.DTOs;
using Stoxly.Api.Models;
using Stoxly.Api.Repositories;

namespace Stoxly.Api.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IPortfolioRepository _portfolioRepository;

    public TransactionService(
        ITransactionRepository transactionRepository,
        IPortfolioRepository portfolioRepository)
    {
        _transactionRepository = transactionRepository;
        _portfolioRepository = portfolioRepository;
    }

    public async Task<TransactionResponse> CreateTransactionAsync(Guid portfolioId, string userId, CreateTransactionRequest request)
    {
        await EnsurePortfolioBelongsToUserAsync(portfolioId, userId);
        ValidateRequest(request.Symbol, request.Quantity, request.Price, request.TradeDate);

        var transaction = new Transaction
        {
            PortfolioId = portfolioId,
            Symbol = request.Symbol.Trim().ToUpperInvariant(),
            Type = request.Type,
            Quantity = request.Quantity,
            Price = request.Price,
            Fee = request.Fee,
            TradeDate = request.TradeDate.Date,
            Notes = request.Notes?.Trim(),
        };

        var created = await _transactionRepository.CreateTransactionAsync(transaction);
        return MapToResponse(created);
    }

    public async Task<List<TransactionResponse>> GetPortfolioTransactionsAsync(Guid portfolioId, string userId)
    {
        await EnsurePortfolioBelongsToUserAsync(portfolioId, userId);

        var transactions = await _transactionRepository.GetPortfolioTransactionsAsync(portfolioId);
        return transactions.Select(MapToResponse).ToList();
    }

    public async Task<TransactionResponse> UpdateTransactionAsync(Guid id, Guid portfolioId, string userId, UpdateTransactionRequest request)
    {
        await EnsurePortfolioBelongsToUserAsync(portfolioId, userId);
        ValidateRequest(request.Symbol, request.Quantity, request.Price, request.TradeDate);

        var transaction = await _transactionRepository.GetTransactionByIdAsync(id, portfolioId)
            ?? throw new KeyNotFoundException($"Transaction with id '{id}' not found.");

        transaction.Symbol = request.Symbol.Trim().ToUpperInvariant();
        transaction.Type = request.Type;
        transaction.Quantity = request.Quantity;
        transaction.Price = request.Price;
        transaction.Fee = request.Fee;
        transaction.TradeDate = request.TradeDate.Date;
        transaction.Notes = request.Notes?.Trim();

        var updated = await _transactionRepository.UpdateTransactionAsync(transaction);
        return MapToResponse(updated);
    }

    public async Task DeleteTransactionAsync(Guid id, Guid portfolioId, string userId)
    {
        await EnsurePortfolioBelongsToUserAsync(portfolioId, userId);
        await _transactionRepository.SoftDeleteTransactionAsync(id, portfolioId);
    }

    private async Task EnsurePortfolioBelongsToUserAsync(Guid portfolioId, string userId)
    {
        _ = await _portfolioRepository.GetPortfolioByIdAsync(portfolioId, userId)
            ?? throw new KeyNotFoundException($"Portfolio with id '{portfolioId}' not found.");
    }

    private static void ValidateRequest(string symbol, decimal quantity, decimal price, DateTime tradeDate)
    {
        if (string.IsNullOrWhiteSpace(symbol))
            throw new ArgumentException("Symbol is required.");

        if (symbol.Trim().Length > 20)
            throw new ArgumentException("Symbol cannot exceed 20 characters.");

        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");

        if (price < 0)
            throw new ArgumentException("Price cannot be negative.");

        if (tradeDate.Date > DateTime.UtcNow.Date)
            throw new ArgumentException("Trade date cannot be in the future.");
    }

    private static TransactionResponse MapToResponse(Transaction transaction)
    {
        return new TransactionResponse
        {
            Id = transaction.Id,
            PortfolioId = transaction.PortfolioId,
            Symbol = transaction.Symbol,
            Type = transaction.Type.ToString(),
            Quantity = transaction.Quantity,
            Price = transaction.Price,
            Fee = transaction.Fee,
            Total = transaction.Quantity * transaction.Price + transaction.Fee,
            TradeDate = transaction.TradeDate,
            Notes = transaction.Notes,
            CreatedAt = transaction.CreatedAt,
        };
    }
}
