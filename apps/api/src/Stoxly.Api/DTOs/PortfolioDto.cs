using System.ComponentModel.DataAnnotations;
using Stoxly.Api.Models;

namespace Stoxly.Api.DTOs;

public class CreatePortfolioRequest
{
    [Required(ErrorMessage = "Portfolio name is required.")]
    [MaxLength(120, ErrorMessage = "Portfolio name cannot exceed 120 characters.")]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [MaxLength(10, ErrorMessage = "Currency code cannot exceed 10 characters.")]
    public string BaseCurrency { get; set; } = "USD";
}

public class CreateSimulationPortfolioRequest
{
    [Required(ErrorMessage = "Portfolio name is required.")]
    [MaxLength(120, ErrorMessage = "Portfolio name cannot exceed 120 characters.")]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required(ErrorMessage = "Starting cash is required.")]
    [Range(0.01, 10_000_000, ErrorMessage = "Starting cash must be between 0.01 and 10,000,000.")]
    public decimal StartingCash { get; set; }
}

public class UpdatePortfolioRequest
{
    [Required(ErrorMessage = "Portfolio name is required.")]
    [MaxLength(120, ErrorMessage = "Portfolio name cannot exceed 120 characters.")]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public class PortfolioResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string BaseCurrency { get; set; } = "USD";
    public string PortfolioType { get; set; } = "TRACKING";
    public decimal? StartingCash { get; set; }
    public decimal? CashBalance { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class HoldingDto
{
    public string Symbol { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal AveragePrice { get; set; }
    public decimal Invested { get; set; }
    public decimal RealizedProfit { get; set; }
    public decimal? CurrentPrice { get; set; }
    public decimal? UnrealizedProfit { get; set; }
}

public class RealizedProfitDto
{
    public string Symbol { get; set; } = string.Empty;
    public decimal RealizedProfit { get; set; }
}

public class PortfolioMetricsDto
{
    public decimal PortfolioValue { get; set; }
    public decimal TotalInvested { get; set; }
    public decimal RealizedProfit { get; set; }
    public decimal UnrealizedProfit { get; set; }
    public decimal TotalProfit { get; set; }
}

public class SimulationPortfolioResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal StartingCash { get; set; }
    public decimal CashBalance { get; set; }
    public decimal CashUsed => StartingCash - CashBalance;
    public decimal CashUsedPercent => StartingCash > 0
        ? Math.Round((CashUsed / StartingCash) * 100, 1)
        : 0;
    public string PortfolioType { get; set; } = "SIMULATION";
    public DateTime CreatedAt { get; set; }
}
