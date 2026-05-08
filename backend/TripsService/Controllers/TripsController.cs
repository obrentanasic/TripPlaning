using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Putopis.Trips.Auth;
using Putopis.Trips.Data;
using Putopis.Trips.Data.Entities;
using Putopis.Trips.Dto;

namespace Putopis.Trips.Controllers;

[ApiController]
[Route("api/trips")]
[Authorize]
public class TripsController : ControllerBase
{
    private readonly TripsDbContext _db;
    private readonly IValidator<CreateTripRequest> _createValidator;
    private readonly IValidator<UpdateTripRequest> _updateValidator;
    private readonly ILogger<TripsController> _log;

    public TripsController(
        TripsDbContext db,
        IValidator<CreateTripRequest> createValidator,
        IValidator<UpdateTripRequest> updateValidator,
        ILogger<TripsController> log)
    {
        _db = db;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _log = log;
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ──────────────────── LIST (JWT only) ────────────────────
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        if (User.IsShareUser()) return Forbid();
        var userId = GetUserId();
        var trips = await _db.Trips
            .AsNoTracking()
            .Where(t => t.UserId == userId)
            .Include(t => t.Destinacije)
            .Include(t => t.Aktivnosti)
            .Include(t => t.Troskovi)
            .Include(t => t.Checklist)
            .Include(t => t.Saradnici)
            .OrderByDescending(t => t.Pocetak)
            .ToListAsync(ct);

        return Ok(trips.Select(ToDto));
    }

    // ──────────────────── GET BY ID (JWT or share token) ────────────────────
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        TripEntity? trip;
        if (User.IsShareUser())
        {
            var claimed = User.FindFirstValue("tripId");
            if (!Guid.TryParse(claimed, out var tid) || tid != id)
                return NotFound(new { error = "Plan nije pronađen." });
            trip = await _db.Trips
                .Include(t => t.Destinacije)
                .Include(t => t.Aktivnosti)
                .Include(t => t.Troskovi)
                .Include(t => t.Checklist)
                .Include(t => t.Saradnici)
                .FirstOrDefaultAsync(t => t.Id == id, ct);
        }
        else
        {
            var userId = GetUserId();
            trip = await FindTrip(id, userId, ct);
        }

        if (trip is null) return NotFound(new { error = "Plan nije pronađen." });
        return Ok(ToDto(trip));
    }

    // ──────────────────── CREATE (JWT only) ────────────────────
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTripRequest req, CancellationToken ct)
    {
        if (User.IsShareUser()) return Forbid();
        var result = await _createValidator.ValidateAsync(req, ct);
        if (!result.IsValid)
            return BadRequest(new { error = result.Errors[0].ErrorMessage });

        var userId = GetUserId();
        var entity = new TripEntity
        {
            UserId = userId,
            Naziv = req.Naziv.Trim(),
            Opis = req.Opis?.Trim() ?? string.Empty,
            Pocetak = DateOnly.Parse(req.Pocetak),
            Kraj = DateOnly.Parse(req.Kraj),
            Budzet = req.Budzet,
            Valuta = req.Valuta,
            Kover = string.IsNullOrWhiteSpace(req.Kover) ? null : req.Kover.Trim(),
            Boja = string.IsNullOrWhiteSpace(req.Boja) ? null : req.Boja.Trim(),
            Napomene = req.Napomene?.Trim() ?? string.Empty,
        };

        _db.Trips.Add(entity);
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("Trip {Id} created by user {UserId}", entity.Id, userId);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDto(entity));
    }

    // ──────────────────── UPDATE (JWT only) ────────────────────
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTripRequest req, CancellationToken ct)
    {
        if (User.IsShareUser()) return Forbid();
        var result = await _updateValidator.ValidateAsync(req, ct);
        if (!result.IsValid)
            return BadRequest(new { error = result.Errors[0].ErrorMessage });

        var userId = GetUserId();
        var trip = await FindTrip(id, userId, ct);
        if (trip is null) return NotFound(new { error = "Plan nije pronađen." });

        trip.Naziv = req.Naziv.Trim();
        trip.Opis = req.Opis?.Trim() ?? string.Empty;
        trip.Pocetak = DateOnly.Parse(req.Pocetak);
        trip.Kraj = DateOnly.Parse(req.Kraj);
        trip.Budzet = req.Budzet;
        trip.Valuta = req.Valuta;
        trip.Kover = string.IsNullOrWhiteSpace(req.Kover) ? null : req.Kover.Trim();
        trip.Boja = string.IsNullOrWhiteSpace(req.Boja) ? null : req.Boja.Trim();
        trip.Napomene = req.Napomene?.Trim() ?? string.Empty;

        await _db.SaveChangesAsync(ct);

        _log.LogInformation("Trip {Id} updated by user {UserId}", id, userId);
        return Ok(ToDto(trip));
    }

    // ──────────────────── DELETE (cascade) — JWT only ────────────────────
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        if (User.IsShareUser()) return Forbid();
        var userId = GetUserId();
        var trip = await _db.Trips.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);
        if (trip is null) return NotFound(new { error = "Plan nije pronađen." });

        _db.Trips.Remove(trip); // cascade delete configured in DbContext
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("Trip {Id} deleted (cascade) by user {UserId}", id, userId);
        return NoContent();
    }

    // ──────────────────── helpers ────────────────────
    private async Task<TripEntity?> FindTrip(Guid id, Guid userId, CancellationToken ct)
    {
        return await _db.Trips
            .Include(t => t.Destinacije)
            .Include(t => t.Aktivnosti)
            .Include(t => t.Troskovi)
            .Include(t => t.Checklist)
            .Include(t => t.Saradnici)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);
    }

    private static TripDto ToDto(TripEntity e) => new()
    {
        Id = e.Id,
        Naziv = e.Naziv,
        Opis = e.Opis,
        Pocetak = e.Pocetak.ToString("yyyy-MM-dd"),
        Kraj = e.Kraj.ToString("yyyy-MM-dd"),
        Budzet = e.Budzet,
        Valuta = e.Valuta,
        Kover = e.Kover,
        Boja = e.Boja,
        Napomene = e.Napomene,
        Destinacije = e.Destinacije.Select(d => new DestinacijaDto
        {
            Id = d.Id,
            Naziv = d.Naziv,
            Lokacija = d.Lokacija,
            Dolazak = d.Dolazak.ToString("yyyy-MM-dd"),
            Odlazak = d.Odlazak.ToString("yyyy-MM-dd"),
            Opis = d.Opis,
            Foto = d.Foto,
        }).ToList(),
        Aktivnosti = e.Aktivnosti.Select(a => new AktivnostDto
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
        }).ToList(),
        Troskovi = e.Troskovi.Select(t => new TrosakDto
        {
            Id = t.Id,
            Naziv = t.Naziv,
            Kategorija = t.Kategorija,
            Iznos = t.Iznos,
            Datum = t.Datum.ToString("yyyy-MM-dd"),
            Opis = t.Opis,
        }).ToList(),
        Checklist = e.Checklist.Select(c => new ChecklistItemDto
        {
            Id = c.Id,
            Naziv = c.Naziv,
            Kategorija = c.Kategorija,
            Zavrseno = c.Zavrseno,
        }).ToList(),
        Saradnici = e.Saradnici.Select(s => new SaradnikDto
        {
            Ime = s.Ime,
            Email = s.Email,
            Uloga = s.Uloga,
        }).ToList(),
    };
}
