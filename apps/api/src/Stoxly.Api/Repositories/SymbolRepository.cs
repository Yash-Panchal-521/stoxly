using Microsoft.EntityFrameworkCore;
using Stoxly.Api.Data;
using Stoxly.Api.Models;

namespace Stoxly.Api.Repositories;

public class SymbolRepository : ISymbolRepository
{
    private readonly AppDbContext _db;

    public SymbolRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Symbol?> GetSymbolAsync(string symbol)
    {
        var ticker = symbol.Trim().ToUpperInvariant();
        return await _db.Symbols
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Ticker == ticker);
    }

    public async Task<IReadOnlyList<Symbol>> SearchSymbolsAsync(string query)
    {
        var term = query.Trim().ToLowerInvariant();
        return await _db.Symbols
            .AsNoTracking()
            .Where(s => EF.Functions.ILike(s.Ticker, $"%{term}%")
                     || (s.Name != null && EF.Functions.ILike(s.Name, $"%{term}%")))
            .OrderBy(s => s.Ticker)
            .Take(50)
            .ToListAsync();
    }

    public async Task InsertSymbolsAsync(IEnumerable<Symbol> symbols)
    {
        var incoming = symbols.ToList();
        if (incoming.Count == 0)
            return;

        var tickers = incoming.Select(s => s.Ticker).ToHashSet(StringComparer.OrdinalIgnoreCase);

        var existing = await _db.Symbols
            .Where(s => tickers.Contains(s.Ticker))
            .ToDictionaryAsync(s => s.Ticker, StringComparer.OrdinalIgnoreCase);

        foreach (var symbol in incoming)
        {
            if (existing.TryGetValue(symbol.Ticker, out var record))
            {
                // Update mutable fields only
                record.Name = symbol.Name;
                record.Exchange = symbol.Exchange;
                record.Currency = symbol.Currency;
                record.Type = symbol.Type;
            }
            else
            {
                _db.Symbols.Add(symbol);
            }
        }

        await _db.SaveChangesAsync();
    }
}
