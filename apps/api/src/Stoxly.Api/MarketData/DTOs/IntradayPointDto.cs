namespace Stoxly.Api.MarketData.DTOs;

/// <summary>Represents a single intraday (hourly) price point returned by the chart API.</summary>
public sealed record IntradayPointDto(string Timestamp, decimal Price);
