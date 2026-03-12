using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Stoxly.Api.Models;

[Table("symbols")]
public class Symbol
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    [Required]
    [Column("symbol")]
    [MaxLength(32)]
    public string Ticker { get; set; } = string.Empty;

    [Column("name")]
    [MaxLength(255)]
    public string? Name { get; set; }

    [Column("exchange")]
    [MaxLength(64)]
    public string? Exchange { get; set; }

    [Column("currency")]
    [MaxLength(10)]
    public string? Currency { get; set; }

    [Column("type")]
    [MaxLength(64)]
    public string? Type { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
