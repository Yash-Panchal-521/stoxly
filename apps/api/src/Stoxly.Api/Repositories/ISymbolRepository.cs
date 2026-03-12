using Stoxly.Api.Models;

namespace Stoxly.Api.Repositories;

public interface ISymbolRepository
{
    /// <summary>Returns the stored symbol record for an exact ticker, or null if not found.</summary>
    Task<Symbol?> GetSymbolAsync(string symbol);

    /// <summary>Returns all symbols whose ticker or name contains the query string (case-insensitive).</summary>
    Task<IReadOnlyList<Symbol>> SearchSymbolsAsync(string query);

    /// <summary>
    /// Upserts the supplied symbols into the database.
    /// Existing records (matched by ticker) are updated; new ones are inserted.
    /// </summary>
    Task InsertSymbolsAsync(IEnumerable<Symbol> symbols);
}
