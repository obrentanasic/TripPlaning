namespace Putopis.Common.Dto;

public sealed class UserDto
{
    public Guid Id { get; set; }
    public string Ime { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Uloga { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime RegistrovanDana { get; set; }
}
