using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Stoxly.Api;
using Stoxly.Api.BackgroundServices;
using Stoxly.Api.Configurations;
using Stoxly.Api.Data;
using Stoxly.Api.Hubs;
using Stoxly.Api.MarketData.Caching;
using Stoxly.Api.MarketData.Clients;
using Stoxly.Api.MarketData.Interfaces;
using Stoxly.Api.MarketData.Services;
using Stoxly.Api.Middleware;
using Stoxly.Api.Repositories;
using Stoxly.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddFirebase(builder.Configuration);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPortfolioRepository, PortfolioRepository>();
builder.Services.AddScoped<IPortfolioService, PortfolioService>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ISymbolRepository, SymbolRepository>();
builder.Services.AddScoped<IWatchlistRepository, WatchlistRepository>();
builder.Services.AddScoped<IWatchlistService, WatchlistService>();
builder.Services.AddSingleton<IFifoEngine, FifoEngine>();
builder.Services.AddScoped<IHoldingsService, HoldingsService>();
builder.Services.AddScoped<IPortfolioMetricsService, PortfolioMetricsService>();
builder.Services.AddScoped<IPortfolioPerformanceService, PortfolioPerformanceService>();
builder.Services.AddScoped<IMarketPriceService, LiveMarketPriceService>();

// ── MarketData module ─────────────────────────────────────────────────────────
builder.Services.Configure<FinnhubOptions>(
    builder.Configuration.GetSection(FinnhubOptions.SectionName));

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

builder.Services.AddHttpClient<IFinnhubClient, FinnhubClient>();
builder.Services.AddHttpClient<IYahooFinanceClient, YahooFinanceClient>(client =>
{
    client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (compatible; Stoxly/1.0)");
});
builder.Services.AddSingleton<IMarketDataCache, RedisMarketDataCache>();
builder.Services.AddScoped<IMarketDataService, MarketDataService>();

// ── Real-time ─────────────────────────────────────────────────────────────────
builder.Services.AddSignalR();
builder.Services.AddHostedService<PriceUpdateWorker>();

builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy(RateLimitPolicies.MarketSearch, context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
        opts.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                    ?? new[] { "http://localhost:3000" })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseRateLimiter();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<FirebaseAuthMiddleware>();
app.UseAuthorization();
app.MapControllers();
app.MapHub<PriceHub>("/hubs/prices");

await app.RunAsync();
