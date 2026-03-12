namespace Stoxly.Api.Hubs;

/// <summary>
/// Payload broadcast to clients on the "PriceUpdated" SignalR event.
/// Contains the minimal fields needed for a live price ticker.
/// </summary>
public sealed record PriceUpdateDto(
    string Symbol,
    decimal Price,
    decimal Change,
    decimal ChangePercent,
    DateTimeOffset UpdatedAt);
