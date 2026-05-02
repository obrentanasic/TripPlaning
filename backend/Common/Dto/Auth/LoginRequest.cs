using System.ComponentModel.DataAnnotations;

namespace Putopis.Common.Dto.Auth;

public sealed class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Lozinka { get; set; } = string.Empty;
}
