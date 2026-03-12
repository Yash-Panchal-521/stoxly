using Stoxly.Api.DTOs;
using Stoxly.Api.Repositories;

namespace Stoxly.Api.Services;

public class PortfolioMetricsService : IPortfolioMetricsService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IFifoEngine _fifoEngine;

    public PortfolioMetricsService(
        ITransactionRepository transactionRepository,
        IPortfolioRepository portfolioRepository,
        IFifoEngine fifoEngine)
    {
        _transactionRepository = transactionRepository;
        _portfolioRepository = portfolioRepository;
        _fifoEngine = fifoEngine;
    }

    public async Task<PortfolioMetricsDto> GetMetricsAsync(
        Guid portfolioId,
        string userId,
        IReadOnlyDictionary<string, decimal>? currentPrices = null)
    {
        _ = await _portfolioRepository.GetPortfolioByIdAsync(portfolioId, userId)
            ?? throw new KeyNotFoundException($"Portfolio with id '{portfolioId}' not found.");

        var transactions = await _transactionRepository.GetPortfolioTransactionsAsync(portfolioId);

        if (transactions.Count == 0)
            return new PortfolioMetricsDto();

        var holdings = _fifoEngine.CalculateHoldings(transactions, currentPrices);
        var realizedProfits = _fifoEngine.CalculateRealizedProfit(transactions);

        var totalInvested = holdings.Sum(h => h.Invested);
        var totalRealizedProfit = realizedProfits.Sum(rp => rp.RealizedProfit);
        var totalUnrealizedProfit = holdings
            .Where(h => h.UnrealizedProfit.HasValue)
            .Sum(h => h.UnrealizedProfit!.Value);
        var portfolioValue = holdings
            .Where(h => h.CurrentPrice.HasValue)
            .Sum(h => h.CurrentPrice!.Value * h.Quantity);

        return new PortfolioMetricsDto
        {
            TotalInvested = totalInvested,
            PortfolioValue = portfolioValue,
            RealizedProfit = totalRealizedProfit,
            UnrealizedProfit = totalUnrealizedProfit,
            TotalProfit = totalRealizedProfit + totalUnrealizedProfit,
        };
    }
}
