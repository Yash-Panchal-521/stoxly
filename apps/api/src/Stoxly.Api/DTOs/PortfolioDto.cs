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
