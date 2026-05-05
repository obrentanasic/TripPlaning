using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Putopis.Trips.Data;
using Putopis.Trips.Data.Entities;
using Putopis.Trips.Dto;

namespace Putopis.Trips.Controllers;

[ApiController]
[Route("api/trips/{tripId:guid}/checklist")]
[Authorize]
public class ChecklistController : ControllerBase
{
    private readonly TripsDbContext _db;
    private readonly IValidator<ChecklistCreateRequest> _create;
    private readonly IValidator<ChecklistUpdateRequest> _update;
    private readonly ILogger<ChecklistController> _log;

    public ChecklistController(
        TripsDbContext db,
        IValidator<ChecklistCreateRequest> create,
        IValidator<ChecklistUpdateRequest> update,
        ILogger<ChecklistController> log)
    {
        _db = db;
        _create = create;
        _update = update;
        _log = log;
    }

    private Guid UserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private async Task<TripEntity?> OwnedTrip(Guid tripId, CancellationToken ct) =>
        await _db.Trips.FirstOrDefaultAsync(t => t.Id == tripId && t.UserId == UserId(), ct);

    [HttpGet]
    public async Task<IActionResult> List(Guid tripId, CancellationToken ct)
    {
        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var items = await _db.ChecklistItems
            .AsNoTracking()
            .Where(c => c.TripId == tripId)
            .ToListAsync(ct);

        return Ok(items.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid tripId, [FromBody] ChecklistCreateRequest req, CancellationToken ct)
    {
        var v = await _create.ValidateAsync(req, ct);
        if (!v.IsValid) return BadRequest(new { error = v.Errors[0].ErrorMessage });

        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var entity = new ChecklistItemEntity
        {
            TripId = tripId,
            Naziv = req.Naziv.Trim(),
            Kategorija = req.Kategorija,
            Zavrseno = req.Zavrseno,
        };
        _db.ChecklistItems.Add(entity);
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("Checklist item {Id} added to trip {TripId}", entity.Id, tripId);
        return CreatedAtAction(nameof(List), new { tripId }, ToDto(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid tripId, Guid id, [FromBody] ChecklistUpdateRequest req, CancellationToken ct)
    {
        var v = await _update.ValidateAsync(req, ct);
        if (!v.IsValid) return BadRequest(new { error = v.Errors[0].ErrorMessage });

        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var c = await _db.ChecklistItems.FirstOrDefaultAsync(x => x.Id == id && x.TripId == tripId, ct);
        if (c is null) return NotFound(new { error = "Stavka nije pronađena." });

        c.Naziv = req.Naziv.Trim();
        c.Kategorija = req.Kategorija;
        c.Zavrseno = req.Zavrseno;

        await _db.SaveChangesAsync(ct);
        return Ok(ToDto(c));
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Toggle(Guid tripId, Guid id, [FromBody] ChecklistTogglePatch req, CancellationToken ct)
    {
        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var c = await _db.ChecklistItems.FirstOrDefaultAsync(x => x.Id == id && x.TripId == tripId, ct);
        if (c is null) return NotFound(new { error = "Stavka nije pronađena." });

        c.Zavrseno = req.Zavrseno;
        await _db.SaveChangesAsync(ct);
        return Ok(ToDto(c));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid tripId, Guid id, CancellationToken ct)
    {
        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var c = await _db.ChecklistItems.FirstOrDefaultAsync(x => x.Id == id && x.TripId == tripId, ct);
        if (c is null) return NotFound(new { error = "Stavka nije pronađena." });

        _db.ChecklistItems.Remove(c);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static ChecklistItemDto ToDto(ChecklistItemEntity c) => new()
    {
        Id = c.Id,
        Naziv = c.Naziv,
        Kategorija = c.Kategorija,
        Zavrseno = c.Zavrseno,
    };
}
