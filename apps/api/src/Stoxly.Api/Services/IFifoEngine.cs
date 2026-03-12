using Stoxly.Api.DTOs;
using Stoxly.Api.Models;

namespace Stoxly.Api.Services;

public interface IFifoEngine
{
    /// <summary>
    /// Processes a set of transactions using FIFO cost basis and returns
    /// the remaining open purchase lots after all sells have been applied.
    /// </summary>
    IReadOnlyList<PurchaseLot> CalculateRemainingLots(IEnumerable<Transaction> transactions);

    /// <summary>
    /// Aggregates remaining FIFO lots into per-symbol holdings.
    /// Optionally accepts current market prices to compute unrealized profit
    /// per symbol: (currentPrice - averagePrice) * quantity.
    /// </summary>
    IReadOnlyList<HoldingDto> CalculateHoldings(
        IEnumerable<Transaction> transactions,
        IReadOnlyDictionary<string, decimal>? currentPrices = null);

    /// <summary>
    /// Calculates realized profit per symbol by comparing each sell price
    /// against the matched purchase lot prices using FIFO ordering.
    /// </summary>
    IReadOnlyList<RealizedProfitDto> CalculateRealizedProfit(IEnumerable<Transaction> transactions);
}
