namespace Stoxly.Api.Exceptions;

public class InsufficientCashException : Exception
{
    public decimal Required { get; }
    public decimal Available { get; }

    public InsufficientCashException(decimal required, decimal available)
        : base($"Insufficient cash. Required: {required:C}. Available: {available:C}.")
    {
        Required = required;
        Available = available;
    }
}
