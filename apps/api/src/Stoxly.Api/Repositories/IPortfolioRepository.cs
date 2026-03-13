using Stoxly.Api.Models;

namespace Stoxly.Api.Repositories;

public interface IPortfolioRepository
{
    Task<Portfolio> CreatePortfolioAsync(Portfolio portfolio);
    Task<List<Portfolio>> GetUserPortfoliosAsync(string userId);
    Task<Portfolio?> GetPortfolioByIdAsync(Guid id, string userId);
    Task<Portfolio> UpdatePortfolioAsync(Portfolio portfolio);
    Task SoftDeletePortfolioAsync(Guid id, string userId);
    Task<Portfolio?> GetSimulationPortfolioAsync(string userId);
}
