namespace Putopis.Trips.Dto;

public sealed class UpdateTripRequest
{
    public string Naziv { get; set; } = string.Empty;
    public string Opis { get; set; } = string.Empty;
    public string Pocetak { get; set; } = string.Empty;
    public string Kraj { get; set; } = string.Empty;
    public decimal Budzet { get; set; }
    public string Valuta { get; set; } = "EUR";
    public string? Kover { get; set; }
    public string? Boja { get; set; }
    public string Napomene { get; set; } = string.Empty;
}
