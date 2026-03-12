using Stoxly.Api.DTOs;

namespace Stoxly.Api.Services;

public interface IHoldingsService
{
    /// <summary>
    /// Returns FIFO-calculated holdings for every symbol in a portfolio.
    /// Each holding includes quantity, average price, invested capital,
    /// and realized profit.
    /// </summary>
    Task<IReadOnlyList<HoldingDto>> GetHoldingsAsync(Guid portfolioId, string userId);
}
