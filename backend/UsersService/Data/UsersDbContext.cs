using Microsoft.EntityFrameworkCore;
using Putopis.Users.Data.Entities;

namespace Putopis.Users.Data;

public class UsersDbContext : DbContext
{
    public UsersDbContext(DbContextOptions<UsersDbContext> options) : base(options)
    {
    }

    public DbSet<UserEntity> Users => Set<UserEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserEntity>(b =>
        {
            b.ToTable("Users");
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.Email).IsUnique();
        });
    }
}
