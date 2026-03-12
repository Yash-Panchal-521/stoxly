namespace Stoxly.Api.Models;

public class PurchaseLot
{
    public Guid TransactionId { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public DateTime TradeDate { get; set; }
}
