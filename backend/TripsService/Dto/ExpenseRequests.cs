namespace Putopis.Trips.Dto;

public sealed class ExpenseCreateRequest
{
    public string Naziv { get; set; } = string.Empty;
    public string Kategorija { get; set; } = "ostalo";
    public decimal Iznos { get; set; }
    public string Datum { get; set; } = string.Empty;
    public string Opis { get; set; } = string.Empty;
}

public sealed class ExpenseUpdateRequest
{
    public string Naziv { get; set; } = string.Empty;
    public string Kategorija { get; set; } = "ostalo";
    public decimal Iznos { get; set; }
    public string Datum { get; set; } = string.Empty;
    public string Opis { get; set; } = string.Empty;
}
