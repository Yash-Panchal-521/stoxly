using Stoxly.Api.DTOs;
using Stoxly.Api.Models;
using Stoxly.Api.Repositories;

namespace Stoxly.Api.Services;

public class PortfolioService : IPortfolioService
{
    private const int MaxPortfoliosPerUser = 20;

    private readonly IPortfolioRepository _portfolioRepository;

    public PortfolioService(IPortfolioRepository portfolioRepository)
    {
        _portfolioRepository = portfolioRepository;
    }

    public async Task<PortfolioResponse> CreatePortfolioAsync(string userId, CreatePortfolioRequest request)
    {
        ValidatePortfolioName(request.Name);

        var existing = await _portfolioRepository.GetUserPortfoliosAsync(userId);

        if (existing.Count >= MaxPortfoliosPerUser)
            throw new InvalidOperationException($"Cannot create more than {MaxPortfoliosPerUser} portfolios.");

        var isDefault = existing.Count == 0;

        var portfolio = new Portfolio
        {
            UserId = userId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            BaseCurrency = request.BaseCurrency,
            IsDefault = isDefault,
        };

        // If this is being set as default, clear the previous default
        if (portfolio.IsDefault)
            await ClearDefaultPortfolioAsync(userId, existing);

        var created = await _portfolioRepository.CreatePortfolioAsync(portfolio);
        return MapToResponse(created);
    }

    public async Task<List<PortfolioResponse>> GetUserPortfoliosAsync(string userId)
    {
        var portfolios = await _portfolioRepository.GetUserPortfoliosAsync(userId);
        return portfolios.Select(MapToResponse).ToList();
    }

    public async Task<PortfolioResponse> GetPortfolioAsync(Guid id, string userId)
    {
        var portfolio = await _portfolioRepository.GetPortfolioByIdAsync(id, userId)
            ?? throw new KeyNotFoundException($"Portfolio with id '{id}' not found.");

        return MapToResponse(portfolio);
    }

    public async Task<PortfolioResponse> UpdatePortfolioAsync(Guid id, string userId, UpdatePortfolioRequest request)
    {
        ValidatePortfolioName(request.Name);

        var portfolio = await _portfolioRepository.GetPortfolioByIdAsync(id, userId)
            ?? throw new KeyNotFoundException($"Portfolio with id '{id}' not found.");

        portfolio.Name = request.Name.Trim();
        portfolio.Description = request.Description?.Trim();

        var updated = await _portfolioRepository.UpdatePortfolioAsync(portfolio);
        return MapToResponse(updated);
    }

    public async Task DeletePortfolioAsync(Guid id, string userId)
    {
        var portfolio = await _portfolioRepository.GetPortfolioByIdAsync(id, userId)
            ?? throw new KeyNotFoundException($"Portfolio with id '{id}' not found.");

        if (portfolio.IsDefault)
            throw new InvalidOperationException("Cannot delete the default portfolio.");

        await _portfolioRepository.SoftDeletePortfolioAsync(id, userId);
    }

    private static void ValidatePortfolioName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Portfolio name is required.");

        if (name.Trim().Length > 120)
            throw new ArgumentException("Portfolio name cannot exceed 120 characters.");
    }

    private async Task ClearDefaultPortfolioAsync(string userId, List<Portfolio> portfolios)
    {
        var currentDefault = portfolios.FirstOrDefault(p => p.IsDefault);
        if (currentDefault is null) return;

        currentDefault.IsDefault = false;
        await _portfolioRepository.UpdatePortfolioAsync(currentDefault);
    }

    private static PortfolioResponse MapToResponse(Portfolio portfolio)
    {
        return new PortfolioResponse
        {
            Id = portfolio.Id,
            Name = portfolio.Name,
            Description = portfolio.Description,
            BaseCurrency = portfolio.BaseCurrency,
            CreatedAt = portfolio.CreatedAt,
        };
    }
}
