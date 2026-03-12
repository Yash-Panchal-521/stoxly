using Microsoft.AspNetCore.SignalR;

namespace Stoxly.Api.Hubs;

/// <summary>
/// SignalR hub for real-time stock price updates.
/// Clients subscribe to individual symbol groups and receive PriceUpdated notifications
/// whenever the PriceUpdateWorker broadcasts fresh prices.
/// </summary>
public sealed class PriceHub : Hub
{
    /// <summary>Joins the client to the price group for the given symbol.</summary>
    public Task SubscribeToSymbol(string symbol) =>
        Groups.AddToGroupAsync(Context.ConnectionId, GroupName(symbol));

    /// <summary>Removes the client from the price group for the given symbol.</summary>
    public Task UnsubscribeFromSymbol(string symbol) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(symbol));

    internal static string GroupName(string symbol) =>
        $"price:{symbol.Trim().ToUpperInvariant()}";
}
