using Stoxly.Api.DTOs;

namespace Stoxly.Api.Services;

public interface ISimulationPortfolioService
{
    Task<SimulationPortfolioResponse> ResetAsync(string userId);
}
