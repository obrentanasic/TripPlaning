using System.ComponentModel.DataAnnotations;

namespace Putopis.Trips.Data.Entities;

public class DestinationEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }
    public TripEntity Trip { get; set; } = default!;

    [Required, MaxLength(200)]
    public string Naziv { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Lokacija { get; set; } = string.Empty;

    public DateOnly Dolazak { get; set; }

    public DateOnly Odlazak { get; set; }

    [MaxLength(2000)]
    public string Opis { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Foto { get; set; }
}
