using Stoxly.Api.DTOs;

namespace Stoxly.Api.Services;

public interface IPortfolioPerformanceService
{
    /// <summary>
    /// Returns daily portfolio value snapshots from the first transaction date to today.
    /// Each data point represents the total market value of holdings on that calendar date.
    /// </summary>
    Task<IReadOnlyList<PerformanceDataPointDto>> GetPerformanceAsync(Guid portfolioId, string userId);
}
