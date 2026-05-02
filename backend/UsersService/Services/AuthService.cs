using Microsoft.EntityFrameworkCore;
using Putopis.Common.Auth;
using Putopis.Common.Dto;
using Putopis.Common.Dto.Auth;
using Putopis.Users.Data;
using Putopis.Users.Data.Entities;

namespace Putopis.Users.Services;

public class AuthService
{
    private readonly UsersDbContext _db;
    private readonly JwtTokenService _jwt;

    public AuthService(UsersDbContext db, JwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest req, CancellationToken ct)
    {
        var email = req.Email.Trim().ToLowerInvariant();

        if (await _db.Users.AnyAsync(u => u.Email == email, ct))
            throw new InvalidOperationException("Korisnik sa ovom email adresom već postoji.");

        var user = new UserEntity
        {
            Id = Guid.NewGuid(),
            Ime = req.Ime.Trim(),
            Email = email,
            LozinkaHash = PasswordHasher.Hash(req.Lozinka),
            Uloga = "korisnik",
            Status = "aktivan",
            RegistrovanDana = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        return Issue(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req, CancellationToken ct)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

        if (user is null || !PasswordHasher.Verify(req.Lozinka, user.LozinkaHash))
            throw new UnauthorizedAccessException("Pogrešan email ili lozinka.");

        if (user.Status == "suspendovan")
            throw new UnauthorizedAccessException("Vaš nalog je suspendovan. Kontaktirajte administratora.");

        return Issue(user);
    }

    private AuthResponse Issue(UserEntity u)
    {
        var (token, expiresAt) = _jwt.Issue(u.Id.ToString(), u.Email, u.Uloga);
        return new AuthResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = new UserDto
            {
                Id = u.Id,
                Ime = u.Ime,
                Email = u.Email,
                Uloga = u.Uloga,
                Status = u.Status,
                RegistrovanDana = u.RegistrovanDana
            }
        };
    }
}
