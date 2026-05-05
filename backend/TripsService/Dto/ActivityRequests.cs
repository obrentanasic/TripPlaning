namespace Putopis.Trips.Dto;

public sealed class ActivityCreateRequest
{
    public Guid? DestId { get; set; }
    public string Naziv { get; set; } = string.Empty;
    public string Datum { get; set; } = string.Empty;
    public string Vreme { get; set; } = "09:00";
    public string Lokacija { get; set; } = string.Empty;
    public string Opis { get; set; } = string.Empty;
    public decimal Trosak { get; set; }
    public string Status { get; set; } = "planirano";
}

public sealed class ActivityUpdateRequest
{
    public Guid? DestId { get; set; }
    public string Naziv { get; set; } = string.Empty;
    public string Datum { get; set; } = string.Empty;
    public string Vreme { get; set; } = "09:00";
    public string Lokacija { get; set; } = string.Empty;
    public string Opis { get; set; } = string.Empty;
    public decimal Trosak { get; set; }
    public string Status { get; set; } = "planirano";
}
