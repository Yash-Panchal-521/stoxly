using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Stoxly.Api.Data;
using Stoxly.Api.Hubs;
using Stoxly.Api.MarketData.Interfaces;
using Stoxly.Api.Repositories;

namespace Stoxly.Api.BackgroundServices;

/// <summary>
/// Runs every 30 seconds to:
///   1. Collect distinct symbols in use across all holdings (and watchlists when implemented).
///   2. Fetch latest prices via IMarketDataService (Redis-first, Finnhub fallback).
///   3. Broadcast PriceUpdated events to subscribed SignalR clients.
/// </summary>
public sealed class PriceUpdateWorker : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(30);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHubContext<PriceHub> _hubContext;
    private readonly ILogger<PriceUpdateWorker> _logger;

    public PriceUpdateWorker(
        IServiceScopeFactory scopeFactory,
        IHubContext<PriceHub> hubContext,
        ILogger<PriceUpdateWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _hubContext = hubContext;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("PriceUpdateWorker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(Interval, stoppingToken);

            try
            {
                await TickAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during price update tick.");
            }
        }

        _logger.LogInformation("PriceUpdateWorker stopped.");
    }

    private async Task TickAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var market = scope.ServiceProvider.GetRequiredService<IMarketDataService>();

        // 1. Collect distinct symbols from holdings (non-deleted transactions)
        var holdingSymbols = await db.Transactions
            .Where(t => t.DeletedAt == null)
            .Select(t => t.Symbol)
            .Distinct()
            .ToListAsync(ct);

        // Merge with watchlist symbols so watched stocks also receive live price broadcasts.
        var watchlistRepo = scope.ServiceProvider.GetRequiredService<IWatchlistRepository>();
        var watchlistSymbols = await watchlistRepo.GetAllDistinctTickersAsync();

        var symbols = holdingSymbols
            .Union(watchlistSymbols, StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (symbols.Count == 0)
        {
            _logger.LogDebug("PriceUpdateWorker: no active symbols found, skipping tick.");
            return;
        }

        _logger.LogDebug("PriceUpdateWorker: fetching prices for {Count} symbols.", symbols.Count);

        // 2. Fetch prices — IMarketDataService checks Redis first, then Finnhub.
        var prices = await market.GetPricesAsync(symbols);

        // 3. Broadcast each updated price to subscribed clients.
        var broadcastTasks = prices.Select(p =>
        {
            var dto = new PriceUpdateDto(
                p.Symbol,
                p.CurrentPrice,
                p.Change,
                p.ChangePercent,
                p.Timestamp);

            return _hubContext.Clients
                .Group(PriceHub.GroupName(p.Symbol))
                .SendAsync("PriceUpdated", dto, ct);
        });

        await Task.WhenAll(broadcastTasks);

        _logger.LogDebug("PriceUpdateWorker: broadcast {Count} price updates.", prices.Count);
    }
}
