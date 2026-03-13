using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Stoxly.Api.Models;

public enum PortfolioType
{
    TRACKING,
    SIMULATION
}

[Table("portfolios")]
public class Portfolio
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    [Required]
    [Column("user_id")]
    [MaxLength(128)]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [Column("name")]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Required]
    [Column("base_currency")]
    [MaxLength(10)]
    public string BaseCurrency { get; set; } = "USD";

    [Column("is_default")]
    public bool IsDefault { get; set; }

    [Required]
    [Column("portfolio_type")]
    public PortfolioType PortfolioType { get; set; } = PortfolioType.TRACKING;

    [Column("starting_cash", TypeName = "numeric(18,4)")]
    public decimal? StartingCash { get; set; }

    [Column("cash_balance", TypeName = "numeric(18,4)")]
    public decimal? CashBalance { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    // Navigation property
    public User? User { get; set; }
}
