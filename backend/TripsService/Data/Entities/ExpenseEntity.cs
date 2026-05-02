using System.ComponentModel.DataAnnotations;

namespace Putopis.Trips.Data.Entities;

public class ExpenseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }
    public TripEntity Trip { get; set; } = default!;

    [Required, MaxLength(200)]
    public string Naziv { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Kategorija { get; set; } = "ostalo"; // prevoz | smestaj | hrana | ulaznice | kupovina | ostalo

    public decimal Iznos { get; set; }

    public DateOnly Datum { get; set; }

    [MaxLength(500)]
    public string Opis { get; set; } = string.Empty;
}
