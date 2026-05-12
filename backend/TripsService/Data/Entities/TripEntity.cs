using System.ComponentModel.DataAnnotations;

namespace Putopis.Trips.Data.Entities;

public class TripEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    [Required, MaxLength(200)]
    public string Naziv { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Opis { get; set; } = string.Empty;

    public DateOnly Pocetak { get; set; }

    public DateOnly Kraj { get; set; }

    public decimal Budzet { get; set; }

    [Required, MaxLength(8)]
    public string Valuta { get; set; } = "EUR";

    [MaxLength(500)]
    public string? Kover { get; set; }

    [MaxLength(20)]
    public string? Boja { get; set; }

    [MaxLength(2000)]
    public string Napomene { get; set; } = string.Empty;

    public List<DestinationEntity> Destinacije { get; set; } = new();
    public List<ActivityEntity> Aktivnosti { get; set; } = new();
    public List<ExpenseEntity> Troskovi { get; set; } = new();
    public List<ChecklistItemEntity> Checklist { get; set; } = new();
}
