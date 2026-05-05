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
[Route("api/trips/{tripId:guid}/activities")]
[Authorize]
public class ActivitiesController : ControllerBase
{
    private readonly TripsDbContext _db;
    private readonly IValidator<ActivityCreateRequest> _create;
    private readonly IValidator<ActivityUpdateRequest> _update;
    private readonly ILogger<ActivitiesController> _log;

    public ActivitiesController(
        TripsDbContext db,
        IValidator<ActivityCreateRequest> create,
        IValidator<ActivityUpdateRequest> update,
        ILogger<ActivitiesController> log)
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

        var items = await _db.Activities
            .AsNoTracking()
            .Where(a => a.TripId == tripId)
            .OrderBy(a => a.Datum).ThenBy(a => a.Vreme)
            .ToListAsync(ct);

        return Ok(items.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid tripId, [FromBody] ActivityCreateRequest req, CancellationToken ct)
    {
        var v = await _create.ValidateAsync(req, ct);
        if (!v.IsValid) return BadRequest(new { error = v.Errors[0].ErrorMessage });

        var trip = await OwnedTrip(tripId, ct);
        if (trip is null) return NotFound(new { error = "Plan nije pronađen." });

        var datum = DateOnly.Parse(req.Datum);
        if (datum < trip.Pocetak || datum > trip.Kraj)
            return BadRequest(new { error = "Datum aktivnosti mora biti u okviru putovanja." });

        var entity = new ActivityEntity
        {
            TripId = tripId,
            DestinationId = req.DestId,
            Naziv = req.Naziv.Trim(),
            Datum = datum,
            Vreme = TimeOnly.Parse(req.Vreme),
            Lokacija = req.Lokacija?.Trim() ?? string.Empty,
            Opis = req.Opis?.Trim() ?? string.Empty,
            Trosak = req.Trosak,
            Status = req.Status,
        };
        _db.Activities.Add(entity);
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("Activity {Id} added to trip {TripId}", entity.Id, tripId);
        return CreatedAtAction(nameof(List), new { tripId }, ToDto(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid tripId, Guid id, [FromBody] ActivityUpdateRequest req, CancellationToken ct)
    {
        var v = await _update.ValidateAsync(req, ct);
        if (!v.IsValid) return BadRequest(new { error = v.Errors[0].ErrorMessage });

        var trip = await OwnedTrip(tripId, ct);
        if (trip is null) return NotFound(new { error = "Plan nije pronađen." });

        var datum = DateOnly.Parse(req.Datum);
        if (datum < trip.Pocetak || datum > trip.Kraj)
            return BadRequest(new { error = "Datum aktivnosti mora biti u okviru putovanja." });

        var a = await _db.Activities.FirstOrDefaultAsync(x => x.Id == id && x.TripId == tripId, ct);
        if (a is null) return NotFound(new { error = "Aktivnost nije pronađena." });

        a.DestinationId = req.DestId;
        a.Naziv = req.Naziv.Trim();
        a.Datum = datum;
        a.Vreme = TimeOnly.Parse(req.Vreme);
        a.Lokacija = req.Lokacija?.Trim() ?? string.Empty;
        a.Opis = req.Opis?.Trim() ?? string.Empty;
        a.Trosak = req.Trosak;
        a.Status = req.Status;

        await _db.SaveChangesAsync(ct);
        return Ok(ToDto(a));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid tripId, Guid id, CancellationToken ct)
    {
        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var a = await _db.Activities.FirstOrDefaultAsync(x => x.Id == id && x.TripId == tripId, ct);
        if (a is null) return NotFound(new { error = "Aktivnost nije pronađena." });

        _db.Activities.Remove(a);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static AktivnostDto ToDto(ActivityEntity a) => new()
    {
        Id = a.Id,
        DestId = a.DestinationId,
        Naziv = a.Naziv,
        Datum = a.Datum.ToString("yyyy-MM-dd"),
        Vreme = a.Vreme.ToString("HH:mm"),
        Lokacija = a.Lokacija,
        Opis = a.Opis,
        Trosak = a.Trosak,
        Status = a.Status,
    };
}
