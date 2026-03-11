using Microsoft.AspNetCore.Mvc;
using Stoxly.Api.DTOs;

namespace Stoxly.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new HealthResponseDto());
    }
}
