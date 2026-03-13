namespace Stoxly.Api.Exceptions;

public class PriceUnavailableException : Exception
{
    public string Symbol { get; }

    public PriceUnavailableException(string symbol)
        : base($"Price unavailable for symbol {symbol}. Cannot execute trade.")
    {
        Symbol = symbol;
    }
}
