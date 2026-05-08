using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Putopis.Trips.Data;
using Putopis.Trips.Services;

namespace Putopis.Trips.Controllers;

public sealed class IssueShareRequest
{
    public string AccessLevel { get; set; } = "view";
}

public sealed class IssueShareResponse
{
    public string Token { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string AccessLevel { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

[ApiController]
[Route("api/trips/{tripId:guid}/share")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class TripShareController : ControllerBase
{
    private readonly TripsDbContext _db;
    private readonly ShareServiceClient _share;
    private readonly IConfiguration _config;
    private readonly ILogger<TripShareController> _log;

    public TripShareController(
        TripsDbContext db,
        ShareServiceClient share,
        IConfiguration config,
        ILogger<TripShareController> log)
    {
        _db = db;
        _share = share;
        _config = config;
        _log = log;
    }

    [HttpPost]
    public async Task<IActionResult> Issue(Guid tripId, [FromBody] IssueShareRequest req, CancellationToken ct)
    {
        if (req.AccessLevel is not ("view" or "edit"))
            return BadRequest(new { error = "Nivo pristupa mora biti view ili edit." });

        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(sub, out var userId))
            return Unauthorized();

        var trip = await _db.Trips.FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == userId, ct);
        if (trip is null) return NotFound(new { error = "Plan nije pronađen." });

        var issued = await _share.IssueAsync(tripId, req.AccessLevel, userId, ct);

        var basePublic = _config["Share:PublicBaseUrl"] ?? "http://localhost:5173/share";
        var url = $"{basePublic.TrimEnd('/')}/{issued.Token}";

        _log.LogInformation("User {UserId} issued share token for trip {TripId} (level={Level})",
            userId, tripId, req.AccessLevel);

        return Ok(new IssueShareResponse
        {
            Token = issued.Token,
            Url = url,
            AccessLevel = issued.AccessLevel,
            ExpiresAt = issued.ExpiresAt,
        });
    }

    [HttpDelete]
    public async Task<IActionResult> RevokeAll(Guid tripId, CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(sub, out var userId))
            return Unauthorized();

        var trip = await _db.Trips.FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == userId, ct);
        if (trip is null) return NotFound();

        await _share.RevokeForTripAsync(tripId, ct);
        return NoContent();
    }
}
