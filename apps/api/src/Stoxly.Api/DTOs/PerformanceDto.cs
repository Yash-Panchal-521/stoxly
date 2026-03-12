namespace Stoxly.Api.DTOs;

/// <summary>A single portfolio value snapshot for a given calendar date.</summary>
public sealed record PerformanceDataPointDto(
    /// <summary>ISO-8601 date string, e.g. "2026-01-15".</summary>
    string Date,
    /// <summary>Total portfolio market value in the portfolio's base currency.</summary>
    decimal Value);
