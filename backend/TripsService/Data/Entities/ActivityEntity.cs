using System.ComponentModel.DataAnnotations;

namespace Putopis.Trips.Data.Entities;

public class ActivityEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }
    public TripEntity Trip { get; set; } = default!;

    public Guid? DestinationId { get; set; }

    [Required, MaxLength(200)]
    public string Naziv { get; set; } = string.Empty;

    public DateOnly Datum { get; set; }

    public TimeOnly Vreme { get; set; }

    [MaxLength(200)]
    public string Lokacija { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Opis { get; set; } = string.Empty;

    public decimal Trosak { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "planirano"; // planirano | rezervisano | završeno | otkazano
}
