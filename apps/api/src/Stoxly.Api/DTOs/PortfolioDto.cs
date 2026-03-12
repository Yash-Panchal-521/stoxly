using System.ComponentModel.DataAnnotations;

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
