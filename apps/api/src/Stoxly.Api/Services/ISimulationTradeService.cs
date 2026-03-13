using Stoxly.Api.DTOs;

namespace Stoxly.Api.Services;

public interface ISimulationTradeService
{
    Task<SimulationTradeResponse> ExecuteBuyAsync(
        Guid portfolioId,
        string userId,
        string symbol,
        decimal quantity,
        string? notes);

    Task<SimulationTradeResponse> ExecuteSellAsync(
        Guid portfolioId,
        string userId,
        string symbol,
        decimal quantity,
        string? notes);

    Task UpdateTradeNotesAsync(Guid transactionId, string userId, string? notes);
}
