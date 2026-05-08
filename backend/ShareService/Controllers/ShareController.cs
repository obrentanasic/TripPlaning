using Microsoft.AspNetCore.Mvc;
using Putopis.Share.Auth;
using Putopis.Share.Dto;
using Putopis.Share.Storage;

namespace Putopis.Share.Controllers;

[ApiController]
[Route("api/share")]
public class ShareController : ControllerBase
{
    private readonly IShareTokenStore _store;
    private readonly IConfiguration _config;
    private readonly ILogger<ShareController> _log;

    public ShareController(IShareTokenStore store, IConfiguration config, ILogger<ShareController> log)
    {
        _store = store;
        _config = config;
        _log = log;
    }

    [HttpPost("internal/issue")]
    [InternalApiKey]
    public async Task<IActionResult> Issue([FromBody] IssueShareRequest req, CancellationToken ct)
    {
        if (req.AccessLevel is not ("view" or "edit"))
            return BadRequest(new { error = "Nivo pristupa mora biti view ili edit." });

        var ttlDays = req.TtlDays ?? _config.GetValue("Share:DefaultTtlDays", 7);
        var ttl = TimeSpan.FromDays(Math.Clamp(ttlDays, 1, 365));

        var state = await _store.IssueAsync(req.TripId, req.AccessLevel, req.IssuedByUserId, ttl, ct);

        _log.LogInformation("Issued share token for trip {TripId} (level={Level}) by user {UserId}",
            req.TripId, req.AccessLevel, req.IssuedByUserId);

        return Ok(new IssueShareResponse
        {
            Token = state.Token,
            TripId = state.TripId,
            AccessLevel = state.AccessLevel,
            IssuedAt = state.IssuedAt,
            ExpiresAt = state.ExpiresAt,
        });
    }

    [HttpGet("{token}")]
    [AllowAnonymousResolve]
    public async Task<IActionResult> Resolve(string token, CancellationToken ct)
    {
        var state = await _store.GetAsync(token, ct);
        if (state is null) return NotFound(new { error = "Token nije pronađen ili je istekao." });

        return Ok(new ShareInfoResponse
        {
            Token = state.Token,
            TripId = state.TripId,
            AccessLevel = state.AccessLevel,
            ExpiresAt = state.ExpiresAt,
        });
    }

    [HttpDelete("internal/{token}")]
    [InternalApiKey]
    public async Task<IActionResult> Revoke(string token, CancellationToken ct)
    {
        var ok = await _store.RevokeAsync(token, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("internal/trip/{tripId:guid}")]
    [InternalApiKey]
    public async Task<IActionResult> RevokeForTrip(Guid tripId, CancellationToken ct)
    {
        var n = await _store.RevokeForTripAsync(tripId, ct);
        _log.LogInformation("Revoked {Count} tokens for trip {TripId}", n, tripId);
        return Ok(new { revoked = n });
    }
}

/// <summary>Marker; share resolve is intentionally anonymous so QR scans work.</summary>
[AttributeUsage(AttributeTargets.Method)]
public sealed class AllowAnonymousResolveAttribute : Attribute { }
