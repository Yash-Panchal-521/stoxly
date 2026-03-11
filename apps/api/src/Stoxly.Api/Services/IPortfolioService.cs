using Stoxly.Api.DTOs;

namespace Stoxly.Api.Services;

public interface IPortfolioService
{
    Task<PortfolioResponse> CreatePortfolioAsync(string userId, CreatePortfolioRequest request);
    Task<List<PortfolioResponse>> GetUserPortfoliosAsync(string userId);
    Task<PortfolioResponse> GetPortfolioAsync(Guid id, string userId);
    Task<PortfolioResponse> UpdatePortfolioAsync(Guid id, string userId, UpdatePortfolioRequest request);
    Task DeletePortfolioAsync(Guid id, string userId);
}
