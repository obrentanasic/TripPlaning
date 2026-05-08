using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Putopis.Trips.Data;
using Putopis.Trips.Dto;

namespace Putopis.Trips.Controllers;

public sealed class AdminTripDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Naziv { get; set; } = string.Empty;
    public string Pocetak { get; set; } = string.Empty;
    public string Kraj { get; set; } = string.Empty;
    public decimal Budzet { get; set; }
    public string Valuta { get; set; } = string.Empty;
    public int Destinacije { get; set; }
    public int Aktivnosti { get; set; }
    public int Troskovi { get; set; }
    public decimal Potroseno { get; set; }
}

[ApiController]
[Route("api/admin/trips")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "admin")]
public class AdminTripsController : ControllerBase
{
    private readonly TripsDbContext _db;

    public AdminTripsController(TripsDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> ListAll(CancellationToken ct)
    {
        var trips = await _db.Trips
            .AsNoTracking()
            .Include(t => t.Destinacije)
            .Include(t => t.Aktivnosti)
            .Include(t => t.Troskovi)
            .OrderByDescending(t => t.Pocetak)
            .ToListAsync(ct);

        var dtos = trips.Select(t => new AdminTripDto
        {
            Id = t.Id,
            UserId = t.UserId,
            Naziv = t.Naziv,
            Pocetak = t.Pocetak.ToString("yyyy-MM-dd"),
            Kraj = t.Kraj.ToString("yyyy-MM-dd"),
            Budzet = t.Budzet,
            Valuta = t.Valuta,
            Destinacije = t.Destinacije.Count,
            Aktivnosti = t.Aktivnosti.Count,
            Troskovi = t.Troskovi.Count,
            Potroseno = t.Troskovi.Sum(x => x.Iznos),
        });

        return Ok(dtos);
    }
}

// silences unused-using analyzer if no other Dto type is used
internal static class _AdminTripsControllerDtoMarker
{
    public static readonly TripDto _ = new();
}
