using System.ComponentModel.DataAnnotations;

namespace Stoxly.Api.DTOs;

public class SimulationBuyRequest
{
    [Required]
    public Guid PortfolioId { get; set; }

    [Required]
    [MaxLength(20)]
    public string Symbol { get; set; } = string.Empty;

    [Required]
    [Range(0.00000001, double.MaxValue, ErrorMessage = "Quantity must be greater than zero.")]
    public decimal Quantity { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class SimulationSellRequest
{
    [Required]
    public Guid PortfolioId { get; set; }

    [Required]
    [MaxLength(20)]
    public string Symbol { get; set; } = string.Empty;

    [Required]
    [Range(0.00000001, double.MaxValue, ErrorMessage = "Quantity must be greater than zero.")]
    public decimal Quantity { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class UpdateTradeNotesRequest
{
    [MaxLength(500, ErrorMessage = "Note must not exceed 500 characters.")]
    public string? Notes { get; set; }
}

public class SimulationTradeResponse
{
    public Guid TransactionId { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public string Side { get; set; } = string.Empty;  // "BUY" | "SELL"
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Total { get; set; }
    public decimal Fee { get; set; }
    public DateTime ExecutedAt { get; set; }
    public decimal RemainingCashBalance { get; set; }
    public string? Notes { get; set; }
}
