namespace Putopis.Trips.Dto;

public sealed class ChecklistCreateRequest
{
    public string Naziv { get; set; } = string.Empty;
    public string Kategorija { get; set; } = "ostalo";
    public bool Zavrseno { get; set; }
}

public sealed class ChecklistUpdateRequest
{
    public string Naziv { get; set; } = string.Empty;
    public string Kategorija { get; set; } = "ostalo";
    public bool Zavrseno { get; set; }
}

public sealed class ChecklistTogglePatch
{
    public bool Zavrseno { get; set; }
}
