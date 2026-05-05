namespace Putopis.Trips.Dto;

public sealed class DestinationCreateRequest
{
    public string Naziv { get; set; } = string.Empty;
    public string Lokacija { get; set; } = string.Empty;
    public string Dolazak { get; set; } = string.Empty; // yyyy-MM-dd
    public string Odlazak { get; set; } = string.Empty;
    public string Opis { get; set; } = string.Empty;
    public string? Foto { get; set; }
}

public sealed class DestinationUpdateRequest
{
    public string Naziv { get; set; } = string.Empty;
    public string Lokacija { get; set; } = string.Empty;
    public string Dolazak { get; set; } = string.Empty;
    public string Odlazak { get; set; } = string.Empty;
    public string Opis { get; set; } = string.Empty;
    public string? Foto { get; set; }
}
