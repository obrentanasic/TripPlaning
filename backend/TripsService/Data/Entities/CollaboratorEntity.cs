using System.ComponentModel.DataAnnotations;

namespace Putopis.Trips.Data.Entities;

public class CollaboratorEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }
    public TripEntity Trip { get; set; } = default!;

    [Required, MaxLength(120)]
    public string Ime { get; set; } = string.Empty;

    [Required, MaxLength(180)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string Uloga { get; set; } = "view"; // view | edit
}
