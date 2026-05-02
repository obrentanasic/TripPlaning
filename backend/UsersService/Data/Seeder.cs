using Microsoft.EntityFrameworkCore;
using Putopis.Common.Auth;
using Putopis.Users.Data.Entities;

namespace Putopis.Users.Data;

public static class Seeder
{
    public static async Task SeedAsync(UsersDbContext db, CancellationToken ct = default)
    {
        await db.Database.MigrateAsync(ct);

        if (await db.Users.AnyAsync(ct)) return;

        db.Users.AddRange(
            new UserEntity
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Ime = "Lana Marković",
                Email = "lana@email.com",
                LozinkaHash = PasswordHasher.Hash("password123"),
                Uloga = "admin",
                Status = "aktivan",
                RegistrovanDana = new DateTime(2025, 11, 12, 0, 0, 0, DateTimeKind.Utc)
            },
            new UserEntity
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Ime = "Marko Petrović",
                Email = "marko@email.com",
                LozinkaHash = PasswordHasher.Hash("password123"),
                Uloga = "korisnik",
                Status = "aktivan",
                RegistrovanDana = new DateTime(2026, 1, 4, 0, 0, 0, DateTimeKind.Utc)
            });

        await db.SaveChangesAsync(ct);
    }
}
