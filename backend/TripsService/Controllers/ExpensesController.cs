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
[Route("api/trips/{tripId:guid}/expenses")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly TripsDbContext _db;
    private readonly IValidator<ExpenseCreateRequest> _create;
    private readonly IValidator<ExpenseUpdateRequest> _update;
    private readonly ILogger<ExpensesController> _log;

    public ExpensesController(
        TripsDbContext db,
        IValidator<ExpenseCreateRequest> create,
        IValidator<ExpenseUpdateRequest> update,
        ILogger<ExpensesController> log)
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

        var items = await _db.Expenses
            .AsNoTracking()
            .Where(e => e.TripId == tripId)
            .OrderByDescending(e => e.Datum)
            .ToListAsync(ct);

        return Ok(items.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid tripId, [FromBody] ExpenseCreateRequest req, CancellationToken ct)
    {
        if (User.IsShareReadOnly()) return Forbid();
        var v = await _create.ValidateAsync(req, ct);
        if (!v.IsValid) return BadRequest(new { error = v.Errors[0].ErrorMessage });

        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var entity = new ExpenseEntity
        {
            TripId = tripId,
            Naziv = req.Naziv.Trim(),
            Kategorija = req.Kategorija,
            Iznos = req.Iznos,
            Datum = DateOnly.Parse(req.Datum),
            Opis = req.Opis?.Trim() ?? string.Empty,
        };
        _db.Expenses.Add(entity);
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("Expense {Id} added to trip {TripId}", entity.Id, tripId);
        return CreatedAtAction(nameof(List), new { tripId }, ToDto(entity));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid tripId, Guid id, [FromBody] ExpenseUpdateRequest req, CancellationToken ct)
    {
        if (User.IsShareReadOnly()) return Forbid();
        var v = await _update.ValidateAsync(req, ct);
        if (!v.IsValid) return BadRequest(new { error = v.Errors[0].ErrorMessage });

        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var e = await _db.Expenses.FirstOrDefaultAsync(x => x.Id == id && x.TripId == tripId, ct);
        if (e is null) return NotFound(new { error = "Trošak nije pronađen." });

        e.Naziv = req.Naziv.Trim();
        e.Kategorija = req.Kategorija;
        e.Iznos = req.Iznos;
        e.Datum = DateOnly.Parse(req.Datum);
        e.Opis = req.Opis?.Trim() ?? string.Empty;

        await _db.SaveChangesAsync(ct);
        return Ok(ToDto(e));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid tripId, Guid id, CancellationToken ct)
    {
        if (User.IsShareReadOnly()) return Forbid();
        if (await OwnedTrip(tripId, ct) is null)
            return NotFound(new { error = "Plan nije pronađen." });

        var e = await _db.Expenses.FirstOrDefaultAsync(x => x.Id == id && x.TripId == tripId, ct);
        if (e is null) return NotFound(new { error = "Trošak nije pronađen." });

        _db.Expenses.Remove(e);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static TrosakDto ToDto(ExpenseEntity e) => new()
    {
        Id = e.Id,
        Naziv = e.Naziv,
        Kategorija = e.Kategorija,
        Iznos = e.Iznos,
        Datum = e.Datum.ToString("yyyy-MM-dd"),
        Opis = e.Opis,
    };
}
