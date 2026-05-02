using System.ComponentModel.DataAnnotations;

namespace Putopis.Trips.Data.Entities;

public class ChecklistItemEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }
    public TripEntity Trip { get; set; } = default!;

    [Required, MaxLength(200)]
    public string Naziv { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Kategorija { get; set; } = "ostalo"; // dokumenti | tehnika | garderoba | higijena | ostalo

    public bool Zavrseno { get; set; }
}
