using Microsoft.EntityFrameworkCore;
using Stoxly.Api.Models;

namespace Stoxly.Api.Data;

public class AppDbContext : DbContext
{
  public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

  public DbSet<User> Users => Set<User>();
  public DbSet<Portfolio> Portfolios => Set<Portfolio>();
  public DbSet<Transaction> Transactions => Set<Transaction>();
  public DbSet<Symbol> Symbols => Set<Symbol>();
  public DbSet<Watchlist> Watchlists => Set<Watchlist>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<User>(entity =>
    {
      entity.HasIndex(u => u.FirebaseUid).IsUnique();
      entity.HasIndex(u => u.Email).IsUnique();
    });

    modelBuilder.Entity<Portfolio>(entity =>
    {
      entity.HasQueryFilter(p => p.DeletedAt == null);

      entity.HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .HasPrincipalKey(u => u.FirebaseUid)
                .OnDelete(DeleteBehavior.Cascade);

      entity.HasIndex(p => p.UserId);
      entity.HasIndex(p => new { p.UserId, p.IsDefault })
                .HasFilter("\"is_default\" = true AND \"deleted_at\" IS NULL")
                .IsUnique();
    });

    modelBuilder.Entity<Symbol>(entity =>
    {
      entity.HasIndex(s => s.Ticker).IsUnique();
    });

    modelBuilder.Entity<Transaction>(entity =>
    {
      entity.HasQueryFilter(t => t.DeletedAt == null);

      entity.Property(t => t.Type)
                .HasConversion<string>();

      entity.Property(t => t.Quantity)
                .HasPrecision(18, 8);

      entity.Property(t => t.Price)
                .HasPrecision(18, 4);

      entity.Property(t => t.Fee)
                .HasPrecision(18, 4);

      entity.HasOne(t => t.Portfolio)
                .WithMany()
                .HasForeignKey(t => t.PortfolioId)
                .OnDelete(DeleteBehavior.Cascade);

      entity.HasIndex(t => t.PortfolioId);
      entity.HasIndex(t => t.Symbol);
      entity.HasIndex(t => t.TradeDate);
    });

    modelBuilder.Entity<Watchlist>(entity =>
    {
      entity.HasOne(w => w.User)
                .WithMany()
                .HasForeignKey(w => w.UserId)
                .HasPrincipalKey(u => u.FirebaseUid)
                .OnDelete(DeleteBehavior.Cascade);

      entity.HasOne(w => w.Symbol)
                .WithMany()
                .HasForeignKey(w => w.Ticker)
                .HasPrincipalKey(s => s.Ticker)
                .OnDelete(DeleteBehavior.Cascade);

      entity.HasIndex(w => w.UserId);
      entity.HasIndex(w => new { w.UserId, w.Ticker }).IsUnique();
    });
  }
}
