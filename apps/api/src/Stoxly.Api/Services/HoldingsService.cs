using Stoxly.Api.DTOs;
using Stoxly.Api.Repositories;

namespace Stoxly.Api.Services;

public class HoldingsService : IHoldingsService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IFifoEngine _fifoEngine;
    private readonly IMarketPriceService _marketPriceService;

    public HoldingsService(
        ITransactionRepository transactionRepository,
        IPortfolioRepository portfolioRepository,
        IFifoEngine fifoEngine,
        IMarketPriceService marketPriceService)
    {
        _transactionRepository = transactionRepository;
        _portfolioRepository = portfolioRepository;
        _fifoEngine = fifoEngine;
        _marketPriceService = marketPriceService;
    }

    public async Task<IReadOnlyList<HoldingDto>> GetHoldingsAsync(Guid portfolioId, string userId)
    {
        _ = await _portfolioRepository.GetPortfolioByIdAsync(portfolioId, userId)
            ?? throw new KeyNotFoundException($"Portfolio with id '{portfolioId}' not found.");

        var transactions = await _transactionRepository.GetPortfolioTransactionsAsync(portfolioId);

        if (transactions.Count == 0)
            return [];

        var symbols = transactions
            .Select(t => t.Symbol)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var prices = await _marketPriceService.GetPricesAsync(symbols);

        return _fifoEngine.CalculateHoldings(transactions, prices);
    }
}
