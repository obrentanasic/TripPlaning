using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Putopis.Trips.Auth;
using Putopis.Trips.Data;
using Putopis.Trips.Data.Entities;
using Putopis.Trips.Dto;

namespace Putopis.Trips.Controllers;

[ApiController]
[Route("api/trips/{tripId:guid}/destinations")]
[Authorize]
public class DestinationsController : ControllerBase
{
    private readonly TripsDbContext _db;
    private readonly IValidator<DestinationCreateRequest> _create;
    private readonly IValidator<DestinationUpdateRequest> _update;
    private readonly ILogger<DestinationsController> _log;

    public DestinationsController(
        TripsDbContext db,
        IValidator<DestinationCreateRequest> create,
        IValidator<DestinationUpdateRequest> update,
        ILogger<DestinationsController> log)
    {
        _db = db;
        _create = create;
        _update = update;
        _log = log;
    }

    private Task<TripEntity?> OwnedTrip(Guid tripId, CancellationToken ct) =>
        this.AuthorizedTripAsync(_db, tripId, ct);

    [HttpGet]
    public async Task<IActionResult> List(Guid tripId, CancellationToken ct)
    {
        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var items = await _db.Destinations
            .AsNoTracking()
            .Where(d => d.TripId == tripId)
            .OrderBy(d => d.Dolazak)
            .ToListAsync(ct);

        return Ok(items.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid tripId, [FromBody] DestinationCreateRequest req, CancellationToken ct)
    {
        if (User.IsShareReadOnly()) return Forbid();
        var v = await _create.ValidateAsync(req, ct);
        if (!v.IsValid) return BadRequest(new { error = v.Errors[0].ErrorMessage });

        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var entity = new DestinationEntity
        {
            TripId = tripId,
            Naziv = req.Naziv.Trim(),
            Lokacija = req.Lokacija.Trim(),
            Dolazak = DateOnly.Parse(req.Dolazak),
            Odlazak = DateOnly.Parse(req.Odlazak),
            Opis = req.Opis?.Trim() ?? string.Empty,
            Foto = string.IsNullOrWhiteSpace(req.Foto) ? null : req.Foto.Trim(),
        };
        _db.Destinations.Add(entity);
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("Destination {Id} added to trip {TripId}", entity.Id, tripId);
        return CreatedAtAction(nameof(List), new { tripId }, ToDto(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid tripId, Guid id, [FromBody] DestinationUpdateRequest req, CancellationToken ct)
    {
        if (User.IsShareReadOnly()) return Forbid();
        var v = await _update.ValidateAsync(req, ct);
        if (!v.IsValid) return BadRequest(new { error = v.Errors[0].ErrorMessage });

        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var d = await _db.Destinations.FirstOrDefaultAsync(x => x.Id == id && x.TripId == tripId, ct);
        if (d is null) return NotFound(new { error = "Destinacija nije pronađena." });

        d.Naziv = req.Naziv.Trim();
        d.Lokacija = req.Lokacija.Trim();
        d.Dolazak = DateOnly.Parse(req.Dolazak);
        d.Odlazak = DateOnly.Parse(req.Odlazak);
        d.Opis = req.Opis?.Trim() ?? string.Empty;
        d.Foto = string.IsNullOrWhiteSpace(req.Foto) ? null : req.Foto.Trim();

        await _db.SaveChangesAsync(ct);
        return Ok(ToDto(d));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid tripId, Guid id, CancellationToken ct)
    {
        if (User.IsShareReadOnly()) return Forbid();
        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var d = await _db.Destinations.FirstOrDefaultAsync(x => x.Id == id && x.TripId == tripId, ct);
        if (d is null) return NotFound(new { error = "Destinacija nije pronađena." });

        // Cascade: remove activities tied to this destination
        var related = _db.Activities.Where(a => a.TripId == tripId && a.DestinationId == id);
        _db.Activities.RemoveRange(related);
        _db.Destinations.Remove(d);
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("Destination {Id} (and its activities) removed from trip {TripId}", id, tripId);
        return NoContent();
    }

    private static DestinacijaDto ToDto(DestinationEntity d) => new()
    {
        Id = d.Id,
        Naziv = d.Naziv,
        Lokacija = d.Lokacija,
        Dolazak = d.Dolazak.ToString("yyyy-MM-dd"),
        Odlazak = d.Odlazak.ToString("yyyy-MM-dd"),
        Opis = d.Opis,
        Foto = d.Foto,
    };
}
