using Microsoft.EntityFrameworkCore;
using Putopis.Trips.Data.Entities;

namespace Putopis.Trips.Data;

public class TripsDbContext : DbContext
{
    public TripsDbContext(DbContextOptions<TripsDbContext> options) : base(options)
    {
    }

    public DbSet<TripEntity> Trips => Set<TripEntity>();
    public DbSet<DestinationEntity> Destinations => Set<DestinationEntity>();
    public DbSet<ActivityEntity> Activities => Set<ActivityEntity>();
    public DbSet<ExpenseEntity> Expenses => Set<ExpenseEntity>();
    public DbSet<ChecklistItemEntity> ChecklistItems => Set<ChecklistItemEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TripEntity>(b =>
        {
            b.ToTable("Trips");
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.UserId);
            b.Property(x => x.Budzet).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<DestinationEntity>(b =>
        {
            b.ToTable("Destinations");
            b.HasKey(x => x.Id);
            b.HasOne(x => x.Trip)
                .WithMany(t => t.Destinacije)
                .HasForeignKey(x => x.TripId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ActivityEntity>(b =>
        {
            b.ToTable("Activities");
            b.HasKey(x => x.Id);
            b.Property(x => x.Trosak).HasColumnType("decimal(18,2)");
            b.HasOne(x => x.Trip)
                .WithMany(t => t.Aktivnosti)
                .HasForeignKey(x => x.TripId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ExpenseEntity>(b =>
        {
            b.ToTable("Expenses");
            b.HasKey(x => x.Id);
            b.Property(x => x.Iznos).HasColumnType("decimal(18,2)");
            b.HasOne(x => x.Trip)
                .WithMany(t => t.Troskovi)
                .HasForeignKey(x => x.TripId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChecklistItemEntity>(b =>
        {
            b.ToTable("ChecklistItems");
            b.HasKey(x => x.Id);
            b.HasOne(x => x.Trip)
                .WithMany(t => t.Checklist)
                .HasForeignKey(x => x.TripId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
