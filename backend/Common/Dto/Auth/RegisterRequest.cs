using System.ComponentModel.DataAnnotations;

namespace Putopis.Common.Dto.Auth;

public sealed class RegisterRequest
{
    [Required, MaxLength(120)]
    public string Ime { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(180)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6), MaxLength(120)]
    public string Lozinka { get; set; } = string.Empty;
}
