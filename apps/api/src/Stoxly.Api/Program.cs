using Microsoft.EntityFrameworkCore;
using Stoxly.Api.Configurations;
using Stoxly.Api.Data;
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
builder.Services.AddSingleton<IFifoEngine, FifoEngine>();
builder.Services.AddScoped<IHoldingsService, HoldingsService>();
builder.Services.AddScoped<IPortfolioMetricsService, PortfolioMetricsService>();
builder.Services.AddScoped<IMarketPriceService, StubMarketPriceService>();

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
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<FirebaseAuthMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.Run();
