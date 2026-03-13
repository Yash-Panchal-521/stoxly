using System.ComponentModel.DataAnnotations;

namespace Stoxly.Api.DTOs;

public class AddWatchlistItemRequest
{
    [Required]
    [MaxLength(20)]
    [RegularExpression(@"^[A-Za-z0-9.\-]{1,20}$",
        ErrorMessage = "Symbol may only contain letters, digits, dots, and hyphens.")]
    public string Symbol { get; set; } = string.Empty;
}

public class WatchlistItemResponse
{
    public string Symbol { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? Exchange { get; set; }
    public decimal? CurrentPrice { get; set; }
    public decimal? Change { get; set; }
    public decimal? ChangePercent { get; set; }
}
