namespace Putopis.Trips.Dto;

public sealed class TripDto
{
    public Guid Id { get; set; }
    public string Naziv { get; set; } = string.Empty;
    public string Opis { get; set; } = string.Empty;
    public string Pocetak { get; set; } = string.Empty;
    public string Kraj { get; set; } = string.Empty;
    public decimal Budzet { get; set; }
    public string Valuta { get; set; } = "EUR";
    public string? Kover { get; set; }
    public string? Boja { get; set; }
    public string Napomene { get; set; } = string.Empty;

    public List<DestinacijaDto> Destinacije { get; set; } = new();
    public List<AktivnostDto> Aktivnosti { get; set; } = new();
    public List<TrosakDto> Troskovi { get; set; } = new();
    public List<ChecklistItemDto> Checklist { get; set; } = new();
    public List<SaradnikDto> Saradnici { get; set; } = new();
}

public sealed class DestinacijaDto
{
    public Guid Id { get; set; }
    public string Naziv { get; set; } = string.Empty;
    public string Lokacija { get; set; } = string.Empty;
    public string Dolazak { get; set; } = string.Empty;
    public string Odlazak { get; set; } = string.Empty;
    public string Opis { get; set; } = string.Empty;
    public string? Foto { get; set; }
}

public sealed class AktivnostDto
{
    public Guid Id { get; set; }
    public Guid? DestId { get; set; }
    public string Naziv { get; set; } = string.Empty;
    public string Datum { get; set; } = string.Empty;
    public string Vreme { get; set; } = string.Empty;
    public string Lokacija { get; set; } = string.Empty;
    public string Opis { get; set; } = string.Empty;
    public decimal Trosak { get; set; }
    public string Status { get; set; } = "planirano";
}

public sealed class TrosakDto
{
    public Guid Id { get; set; }
    public string Naziv { get; set; } = string.Empty;
    public string Kategorija { get; set; } = "ostalo";
    public decimal Iznos { get; set; }
    public string Datum { get; set; } = string.Empty;
    public string Opis { get; set; } = string.Empty;
}

public sealed class ChecklistItemDto
{
    public Guid Id { get; set; }
    public string Naziv { get; set; } = string.Empty;
    public string Kategorija { get; set; } = "ostalo";
    public bool Zavrseno { get; set; }
}

public sealed class SaradnikDto
{
    public string Ime { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Uloga { get; set; } = "view";
}
