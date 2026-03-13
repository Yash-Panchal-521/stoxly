namespace Stoxly.Api.Exceptions;

public class InsufficientHoldingsException : Exception
{
    public string Symbol { get; }
    public decimal Requested { get; }
    public decimal Available { get; }

    public InsufficientHoldingsException(string symbol, decimal requested, decimal available)
        : base($"Insufficient holdings for {symbol}. Requested: {requested}. Available: {available}.")
    {
        Symbol = symbol;
        Requested = requested;
        Available = available;
    }
}
