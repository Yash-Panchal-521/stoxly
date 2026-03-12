using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Stoxly.Api.Models;

namespace Stoxly.Api.DTOs;

public class CreateTransactionRequest
{
    [Required]
    [MaxLength(20)]
    [RegularExpression(@"^[A-Za-z0-9.\-]{1,20}$",
        ErrorMessage = "Symbol may only contain letters, digits, dots, and hyphens.")]
    public string Symbol { get; set; } = string.Empty;

    [Required]
    public TransactionType Type { get; set; }

    [Required]
    [Range(0.00000001, double.MaxValue, ErrorMessage = "Quantity must be greater than zero.")]
    public decimal Quantity { get; set; }

    [Required]
    [Range(0.00000001, double.MaxValue, ErrorMessage = "Price must be greater than zero.")]
    public decimal Price { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Fee cannot be negative.")]
    public decimal Fee { get; set; }

    [Required]
    public DateTime TradeDate { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class UpdateTransactionRequest
{
    [Required]
    public Guid PortfolioId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Fee cannot be negative.")]
    public decimal Fee { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class TransactionResponse
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Fee { get; set; }
    public decimal Total { get; set; }
    public DateTime TradeDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}
