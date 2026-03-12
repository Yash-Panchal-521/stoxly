using Stoxly.Api.DTOs;
using Stoxly.Api.MarketData.Interfaces;
using Stoxly.Api.Models;
using Stoxly.Api.Repositories;

namespace Stoxly.Api.Services;

public sealed class PortfolioPerformanceService : IPortfolioPerformanceService
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IFifoEngine _fifoEngine;
    private readonly IMarketDataService _marketDataService;

    public PortfolioPerformanceService(
        IPortfolioRepository portfolioRepository,
        ITransactionRepository transactionRepository,
        IFifoEngine fifoEngine,
        IMarketDataService marketDataService)
    {
        _portfolioRepository = portfolioRepository;
        _transactionRepository = transactionRepository;
        _fifoEngine = fifoEngine;
        _marketDataService = marketDataService;
    }

    public async Task<IReadOnlyList<PerformanceDataPointDto>> GetPerformanceAsync(
        Guid portfolioId, string userId)
    {
        // 1. Verify ownership
        _ = await _portfolioRepository.GetPortfolioByIdAsync(portfolioId, userId)
            ?? throw new KeyNotFoundException($"Portfolio '{portfolioId}' not found.");

        // 2. Load all active transactions sorted by trade date
        var transactions = (await _transactionRepository.GetPortfolioTransactionsAsync(portfolioId))
            .OrderBy(t => t.TradeDate)
            .ThenBy(t => t.CreatedAt)
            .ToList();

        if (transactions.Count == 0)
            return [];

        // 3. Date range: first transaction → today
        var startDate = DateOnly.FromDateTime(transactions[0].TradeDate.Date);
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow.Date);

        var symbols = transactions
            .Select(t => t.Symbol.ToUpperInvariant())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // 4. Fetch today's real-time prices via the free /quote endpoint.
        //    These are used to replace fill-forward values on today's date only.
        var todayQuotes = await _marketDataService.GetPricesAsync(symbols);
        var todayPrices = todayQuotes.ToDictionary(
            q => q.Symbol, q => q.CurrentPrice, StringComparer.OrdinalIgnoreCase);

        // 5. Build fill-forward price map using transaction prices as the historical
        //    source (no paid historical endpoint required). For each symbol the price
        //    carries forward from the most-recently-executed transaction until a newer
        //    one updates it. Today's entry is overridden with the live quote.
        var priceMap = BuildTransactionPriceMap(transactions, symbols, startDate, endDate, todayPrices);

        // 6. Walk every calendar day in the range and compute portfolio value
        var result = new List<PerformanceDataPointDto>();
        var currentDate = startDate;

        while (currentDate <= endDate)
        {
            var txsUpToDate = transactions
                .Where(t => DateOnly.FromDateTime(t.TradeDate.Date) <= currentDate);

            var holdings = _fifoEngine.CalculateHoldings(txsUpToDate);

            if (holdings.Count > 0)
            {
                var value = holdings.Sum(h =>
                {
                    if (!priceMap.TryGetValue(h.Symbol, out var dateMap))
                        return 0m;
                    dateMap.TryGetValue(currentDate, out var price);
                    return h.Quantity * price;
                });

                if (value > 0)
                    result.Add(new PerformanceDataPointDto(
                        currentDate.ToString("yyyy-MM-dd"), value));
            }

            currentDate = currentDate.AddDays(1);
        }

        return result.AsReadOnly();
    }

    /// <summary>
    /// Builds a per-symbol, per-date price map using transaction prices as the
    /// historical data source. The last known transaction price is carried forward
    /// for each subsequent day. On <paramref name="to"/> (today), real-time quotes
    /// from <paramref name="todayPrices"/> are used when available.
    /// </summary>
    private static Dictionary<string, Dictionary<DateOnly, decimal>> BuildTransactionPriceMap(
        List<Transaction> transactions,
        List<string> symbols,
        DateOnly from,
        DateOnly to,
        Dictionary<string, decimal> todayPrices)
    {
        var result = new Dictionary<string, Dictionary<DateOnly, decimal>>(
            StringComparer.OrdinalIgnoreCase);

        foreach (var symbol in symbols)
        {
            var txPrices = transactions
                .Where(t => t.Symbol.Equals(symbol, StringComparison.OrdinalIgnoreCase))
                .OrderBy(t => t.TradeDate)
                .Select(t => (Date: DateOnly.FromDateTime(t.TradeDate.Date), t.Price))
                .ToList();

            if (txPrices.Count == 0)
                continue;

            result[symbol] = BuildSymbolPriceMap(txPrices, from, to, symbol, todayPrices);
        }

        return result;
    }

    private static Dictionary<DateOnly, decimal> BuildSymbolPriceMap(
        List<(DateOnly Date, decimal Price)> txPrices,
        DateOnly from,
        DateOnly to,
        string symbol,
        Dictionary<string, decimal> todayPrices)
    {
        var map = new Dictionary<DateOnly, decimal>();
        decimal lastPrice = 0m;
        int txIdx = 0;
        var current = from;

        while (current <= to)
        {
            lastPrice = AdvanceTxPrice(txPrices, ref txIdx, current, lastPrice);

            if (current == to && todayPrices.TryGetValue(symbol, out var rtPrice) && rtPrice > 0)
                lastPrice = rtPrice;

            if (lastPrice > 0)
                map[current] = lastPrice;

            current = current.AddDays(1);
        }

        return map;
    }

    /// <summary>Advances through sorted transaction prices up to <paramref name="upTo"/> and returns the last seen price.</summary>
    private static decimal AdvanceTxPrice(
        List<(DateOnly Date, decimal Price)> prices, ref int idx, DateOnly upTo, decimal current)
    {
        while (idx < prices.Count && prices[idx].Date <= upTo)
            current = prices[idx++].Price;
        return current;
    }
}