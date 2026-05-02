namespace Putopis.Common.Auth;

public static class PasswordHasher
{
    public static string Hash(string lozinka) => BCrypt.Net.BCrypt.HashPassword(lozinka, workFactor: 11);

    public static bool Verify(string lozinka, string hash) => BCrypt.Net.BCrypt.Verify(lozinka, hash);
}
