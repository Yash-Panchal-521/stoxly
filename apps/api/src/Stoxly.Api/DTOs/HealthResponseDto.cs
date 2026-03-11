namespace Stoxly.Api.DTOs;

public class HealthResponseDto
{
    public string Status { get; set; } = "ok";
    public string Service { get; set; } = "Stoxly API";
}
