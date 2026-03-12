using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace Stoxly.Api.MarketData.Caching;

public sealed class RedisMarketDataCache : IMarketDataCache
{
    private readonly IDistributedCache _cache;

    public RedisMarketDataCache(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<T?> GetAsync<T>(string key) where T : class
    {
        var bytes = await _cache.GetAsync(key);
        return bytes is null ? null : JsonSerializer.Deserialize<T>(bytes);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan expiry) where T : class
    {
        var bytes = JsonSerializer.SerializeToUtf8Bytes(value);
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiry
        };
        await _cache.SetAsync(key, bytes, options);
    }
}
