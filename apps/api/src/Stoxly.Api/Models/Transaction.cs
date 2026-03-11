using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Stoxly.Api.Models;

public enum TransactionType
{
    BUY,
    SELL,
}

[Table("transactions")]
public class Transaction
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    [Required]
    [Column("portfolio_id")]
    public Guid PortfolioId { get; set; }

    [Required]
    [Column("symbol")]
    [MaxLength(20)]
    public string Symbol { get; set; } = string.Empty;

    [Required]
    [Column("type")]
    [MaxLength(4)]
    public TransactionType Type { get; set; }

    [Required]
    [Column("quantity")]
    public decimal Quantity { get; set; }

    [Required]
    [Column("price")]
    public decimal Price { get; set; }

    [Column("fee")]
    public decimal Fee { get; set; }

    [Required]
    [Column("trade_date")]
    public DateTime TradeDate { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    // Navigation property
    public Portfolio? Portfolio { get; set; }
}
