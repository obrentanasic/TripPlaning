using Microsoft.AspNetCore.Mvc;
using Putopis.Common.Dto.Auth;
using Putopis.Users.Services;

namespace Putopis.Users.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;
    private readonly ILogger<AuthController> _log;

    public AuthController(AuthService auth, ILogger<AuthController> log)
    {
        _auth = auth;
        _log = log;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        try
        {
            var res = await _auth.RegisterAsync(req, ct);
            return Ok(res);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        try
        {
            var res = await _auth.LoginAsync(req, ct);
            return Ok(res);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }
}
