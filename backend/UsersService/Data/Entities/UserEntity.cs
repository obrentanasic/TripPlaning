using System.ComponentModel.DataAnnotations;

namespace Putopis.Users.Data.Entities;

public class UserEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(120)]
    public string Ime { get; set; } = string.Empty;

    [Required, MaxLength(180)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string LozinkaHash { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Uloga { get; set; } = "korisnik"; // korisnik | admin

    [Required, MaxLength(20)]
    public string Status { get; set; } = "aktivan"; // aktivan | suspendovan

    public DateTime RegistrovanDana { get; set; } = DateTime.UtcNow;
}
