using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Stoxly.Api.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    [Required]
    [Column("firebase_uid")]
    [MaxLength(128)]
    public string FirebaseUid { get; set; } = string.Empty;

    [Required]
    [Column("email")]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    [Column("plan")]
    [MaxLength(50)]
    public string Plan { get; set; } = "free";
}
