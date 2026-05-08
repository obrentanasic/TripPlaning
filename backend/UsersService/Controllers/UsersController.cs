using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Putopis.Common.Dto;
using Putopis.Common.Dto.Auth;
using Putopis.Users.Data;
using Putopis.Users.Data.Entities;

namespace Putopis.Users.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UsersDbContext _db;
    private readonly ILogger<UsersController> _log;

    public UsersController(UsersDbContext db, ILogger<UsersController> log)
    {
        _db = db;
        _log = log;
    }

    private Guid? CurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(sub, out var id) ? id : null;
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var id = CurrentUserId();
        if (id is null) return Unauthorized();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id.Value, ct);
        if (user is null) return NotFound();
        return Ok(ToDto(user));
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var users = await _db.Users
            .AsNoTracking()
            .OrderBy(u => u.RegistrovanDana)
            .ToListAsync(ct);
        return Ok(users.Select(ToDto));
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> SetStatus(Guid id, [FromBody] StatusUpdateRequest req, CancellationToken ct)
    {
        if (req.Status is not ("aktivan" or "suspendovan"))
            return BadRequest(new { error = "Status mora biti aktivan ili suspendovan." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null) return NotFound(new { error = "Korisnik nije pronađen." });

        // Don't let an admin suspend themselves
        if (user.Id == CurrentUserId() && req.Status == "suspendovan")
            return BadRequest(new { error = "Ne možete suspendovati svoj nalog." });

        user.Status = req.Status;
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("User {Id} status -> {Status} (by admin {AdminId})",
            id, req.Status, CurrentUserId());

        return Ok(ToDto(user));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        if (id == CurrentUserId())
            return BadRequest(new { error = "Ne možete obrisati svoj nalog." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null) return NotFound(new { error = "Korisnik nije pronađen." });

        _db.Users.Remove(user);
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("User {Id} deleted by admin {AdminId}", id, CurrentUserId());
        return NoContent();
    }

    private static UserDto ToDto(UserEntity u) => new()
    {
        Id = u.Id,
        Ime = u.Ime,
        Email = u.Email,
        Uloga = u.Uloga,
        Status = u.Status,
        RegistrovanDana = u.RegistrovanDana,
    };
}
