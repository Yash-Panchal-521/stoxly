using Microsoft.EntityFrameworkCore;
using Stoxly.Api.Data;
using Stoxly.Api.DTOs;
using Stoxly.Api.Exceptions;
using Stoxly.Api.Models;
using Stoxly.Api.Repositories;

namespace Stoxly.Api.Services;

public class SimulationTradeService : ISimulationTradeService
{
    private readonly AppDbContext _db;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMarketPriceService _marketPriceService;
    private readonly IFifoEngine _fifoEngine;

    public SimulationTradeService(
        AppDbContext db,
        ITransactionRepository transactionRepository,
        IMarketPriceService marketPriceService,
        IFifoEngine fifoEngine)
    {
        _db = db;
        _transactionRepository = transactionRepository;
        _marketPriceService = marketPriceService;
        _fifoEngine = fifoEngine;
    }

    public async Task<SimulationTradeResponse> ExecuteBuyAsync(
        Guid portfolioId,
        string userId,
        string symbol,
        decimal quantity,
        string? notes)
    {
        var normalizedSymbol = symbol.Trim().ToUpperInvariant();

        var portfolio = await LoadAndValidateSimulationPortfolioAsync(portfolioId, userId);

        var price = await FetchPriceAsync(normalizedSymbol);

        var totalCost = quantity * price;
        var cashBalance = portfolio.CashBalance ?? 0;

        if (cashBalance < totalCost)
            throw new InsufficientCashException(required: totalCost, available: cashBalance);

        await using var dbTransaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var transaction = new Transaction
            {
                PortfolioId = portfolioId,
                Symbol = normalizedSymbol,
                Type = TransactionType.BUY,
                Quantity = quantity,
                Price = price,
                Fee = 0,
                TradeDate = DateTime.UtcNow,
                Notes = notes?.Trim(),
            };

            await _transactionRepository.CreateTransactionAsync(transaction);

            portfolio.CashBalance = cashBalance - totalCost;
            portfolio.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await dbTransaction.CommitAsync();

            return new SimulationTradeResponse
            {
                TransactionId = transaction.Id,
                Symbol = normalizedSymbol,
                Side = "BUY",
                Quantity = quantity,
                Price = price,
                Total = totalCost,
                Fee = 0,
                ExecutedAt = transaction.TradeDate,
                RemainingCashBalance = portfolio.CashBalance ?? 0,
                Notes = transaction.Notes,
            };
        }
        catch
        {
            await dbTransaction.RollbackAsync();
            throw;
        }
    }

    public async Task<SimulationTradeResponse> ExecuteSellAsync(
        Guid portfolioId,
        string userId,
        string symbol,
        decimal quantity,
        string? notes)
    {
        var normalizedSymbol = symbol.Trim().ToUpperInvariant();

        var portfolio = await LoadAndValidateSimulationPortfolioAsync(portfolioId, userId);

        var existingTransactions = await _transactionRepository.GetPortfolioTransactionsAsync(portfolioId);
        var symbolTransactions = existingTransactions
            .Where(t => string.Equals(t.Symbol, normalizedSymbol, StringComparison.OrdinalIgnoreCase))
            .ToList();

        var remainingLots = _fifoEngine.CalculateRemainingLots(symbolTransactions);
        var availableQuantity = remainingLots.Sum(lot => lot.Quantity);

        if (availableQuantity < quantity)
            throw new InsufficientHoldingsException(symbol: normalizedSymbol, requested: quantity, available: availableQuantity);

        var price = await FetchPriceAsync(normalizedSymbol);
        var proceeds = quantity * price;
        var cashBalance = portfolio.CashBalance ?? 0;

        await using var dbTransaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var transaction = new Transaction
            {
                PortfolioId = portfolioId,
                Symbol = normalizedSymbol,
                Type = TransactionType.SELL,
                Quantity = quantity,
                Price = price,
                Fee = 0,
                TradeDate = DateTime.UtcNow,
                Notes = notes?.Trim(),
            };

            await _transactionRepository.CreateTransactionAsync(transaction);

            portfolio.CashBalance = cashBalance + proceeds;
            portfolio.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await dbTransaction.CommitAsync();

            return new SimulationTradeResponse
            {
                TransactionId = transaction.Id,
                Symbol = normalizedSymbol,
                Side = "SELL",
                Quantity = quantity,
                Price = price,
                Total = proceeds,
                Fee = 0,
                ExecutedAt = transaction.TradeDate,
                RemainingCashBalance = portfolio.CashBalance ?? 0,
                Notes = transaction.Notes,
            };
        }
        catch
        {
            await dbTransaction.RollbackAsync();
            throw;
        }
    }

    public async Task UpdateTradeNotesAsync(Guid transactionId, string userId, string? notes)
    {
        var row = await (
            from t in _db.Transactions
            join p in _db.Portfolios on t.PortfolioId equals p.Id
            where t.Id == transactionId && t.DeletedAt == null && p.DeletedAt == null
            select new { Transaction = t, PortfolioUserId = p.UserId }
        ).FirstOrDefaultAsync();

        if (row is null)
            throw new KeyNotFoundException($"Trade '{transactionId}' not found.");

        if (row.PortfolioUserId != userId)
            throw new UnauthorizedAccessException("You do not have access to this trade.");

        row.Transaction.Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        row.Transaction.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    private async Task<Portfolio> LoadAndValidateSimulationPortfolioAsync(Guid portfolioId, string userId)
    {
        var portfolio = await _db.Portfolios
            .Where(p => p.Id == portfolioId && p.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (portfolio is null)
            throw new KeyNotFoundException($"Portfolio '{portfolioId}' not found.");

        if (portfolio.UserId != userId)
            throw new UnauthorizedAccessException("You do not have access to this portfolio.");

        if (portfolio.PortfolioType != PortfolioType.SIMULATION)
            throw new ArgumentException("Trading is only available on simulation portfolios.");

        return portfolio;
    }

    private async Task<decimal> FetchPriceAsync(string symbol)
    {
        var prices = await _marketPriceService.GetPricesAsync([symbol]);

        if (!prices.TryGetValue(symbol, out var price) || price <= 0)
            throw new PriceUnavailableException(symbol);

        return price;
    }
}
