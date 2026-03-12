using Stoxly.Api.DTOs;
using Stoxly.Api.Models;

namespace Stoxly.Api.Services;

public class FifoEngine : IFifoEngine
{
    private sealed record FifoResult(
        Dictionary<string, Queue<PurchaseLot>> OpenLots,
        Dictionary<string, decimal> RealizedProfitBySymbol);

    /// <summary>
    /// Core FIFO engine. Maintains one queue per symbol and accumulates
    /// realized profit as sells are matched against purchase lots.
    /// </summary>
    private FifoResult RunFifo(IEnumerable<Transaction> transactions)
    {
        var sorted = transactions
            .OrderBy(t => t.TradeDate)
            .ThenBy(t => t.CreatedAt)
            .ToList();

        var openLots = new Dictionary<string, Queue<PurchaseLot>>(StringComparer.OrdinalIgnoreCase);
        var realizedProfit = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);

        foreach (var tx in sorted)
        {
            if (tx.Type == TransactionType.BUY)
            {
                if (!openLots.TryGetValue(tx.Symbol, out var buyQueue))
                {
                    buyQueue = new Queue<PurchaseLot>();
                    openLots[tx.Symbol] = buyQueue;
                }

                buyQueue.Enqueue(new PurchaseLot
                {
                    TransactionId = tx.Id,
                    Symbol = tx.Symbol,
                    Quantity = tx.Quantity,
                    Price = tx.Price,
                    TradeDate = tx.TradeDate,
                });
            }
            else if (tx.Type == TransactionType.SELL &&
                     openLots.TryGetValue(tx.Symbol, out var sellQueue))
            {
                ApplySell(tx, sellQueue, realizedProfit);
            }
        }

        return new FifoResult(openLots, realizedProfit);
    }

    private static void ApplySell(
        Transaction tx,
        Queue<PurchaseLot> queue,
        Dictionary<string, decimal> realizedProfit)
    {
        realizedProfit.TryAdd(tx.Symbol, 0);
        var remainingToSell = tx.Quantity;

        while (remainingToSell > 0 && queue.Count > 0)
        {
            var lot = queue.Peek();
            var quantityMatched = Math.Min(remainingToSell, lot.Quantity);

            realizedProfit[tx.Symbol] += (tx.Price - lot.Price) * quantityMatched;
            remainingToSell -= quantityMatched;
            lot.Quantity -= quantityMatched;

            if (lot.Quantity == 0)
                queue.Dequeue();
        }
    }

    /// <inheritdoc/>
    public IReadOnlyList<PurchaseLot> CalculateRemainingLots(IEnumerable<Transaction> transactions)
    {
        var result = RunFifo(transactions);
        return result.OpenLots.Values.SelectMany(q => q).ToList();
    }

    /// <inheritdoc/>
    public IReadOnlyList<HoldingDto> CalculateHoldings(
        IEnumerable<Transaction> transactions,
        IReadOnlyDictionary<string, decimal>? currentPrices = null)
    {
        var result = RunFifo(transactions);

        return result.OpenLots
            .Where(kv => kv.Value.Count > 0)
            .Select(kv =>
            {
                var lots = kv.Value;
                var quantity = lots.Sum(lot => lot.Quantity);
                var invested = lots.Sum(lot => lot.Quantity * lot.Price);
                var averagePrice = quantity > 0 ? invested / quantity : 0;

                decimal? currentPrice = null;
                decimal? unrealizedProfit = null;

                if (currentPrices is not null &&
                    currentPrices.TryGetValue(kv.Key, out var price))
                {
                    currentPrice = price;
                    unrealizedProfit = (price - averagePrice) * quantity;
                }

                return new HoldingDto
                {
                    Symbol = kv.Key,
                    Quantity = quantity,
                    Invested = invested,
                    AveragePrice = averagePrice,
                    RealizedProfit = result.RealizedProfitBySymbol.GetValueOrDefault(kv.Key),
                    CurrentPrice = currentPrice,
                    UnrealizedProfit = unrealizedProfit,
                };
            })
            .OrderBy(h => h.Symbol)
            .ToList();
    }

    /// <inheritdoc/>
    public IReadOnlyList<RealizedProfitDto> CalculateRealizedProfit(IEnumerable<Transaction> transactions)
    {
        var result = RunFifo(transactions);

        return result.RealizedProfitBySymbol
            .Select(kv => new RealizedProfitDto
            {
                Symbol = kv.Key,
                RealizedProfit = kv.Value,
            })
            .OrderBy(r => r.Symbol)
            .ToList();
    }
}
