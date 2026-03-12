using Stoxly.Api.DTOs;

namespace Stoxly.Api.Services;

public interface IPortfolioMetricsService
{
    /// <summary>
    /// Calculates portfolio-level metrics from FIFO holdings and current market prices.
    /// <para>
    /// portfolioValue    = sum(currentPrice * quantity) for holdings with a known price.<br/>
    /// totalInvested     = sum(invested) across all open holdings.<br/>
    /// realizedProfit    = sum of locked-in profit from all closed lots (including fully exited positions).<br/>
    /// unrealizedProfit  = sum(unrealizedProfit) for holdings with a known current price.<br/>
    /// totalProfit       = realizedProfit + unrealizedProfit.
    /// </para>
    /// </summary>
    Task<PortfolioMetricsDto> GetMetricsAsync(
        Guid portfolioId,
        string userId,
        IReadOnlyDictionary<string, decimal>? currentPrices = null);
}
