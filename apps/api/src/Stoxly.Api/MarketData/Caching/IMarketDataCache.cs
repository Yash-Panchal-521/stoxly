namespace Stoxly.Api.MarketData.Caching;

public interface IMarketDataCache
{
    Task<T?> GetAsync<T>(string key) where T : class;
    Task SetAsync<T>(string key, T value, TimeSpan expiry) where T : class;
}
