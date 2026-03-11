using System.Security.Claims;
using FirebaseAdmin.Auth;
using Stoxly.Api.Services;

namespace Stoxly.Api.Middleware;

public class FirebaseAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<FirebaseAuthMiddleware> _logger;

    public FirebaseAuthMiddleware(RequestDelegate next, ILogger<FirebaseAuthMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip auth for endpoints without the [FirebaseAuthorize] metadata
        var endpoint = context.GetEndpoint();
        var requiresAuth = endpoint?.Metadata.GetMetadata<FirebaseAuthorizeAttribute>() != null;

        if (!requiresAuth)
        {
            await _next(context);
            return;
        }

        var authHeader = context.Request.Headers.Authorization.ToString();

        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.Ordinal))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "Missing or invalid Authorization header." });
            return;
        }

        var token = authHeader["Bearer ".Length..];

        try
        {
            var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, decodedToken.Uid),
                new("firebase_uid", decodedToken.Uid),
            };

            var emailValue = decodedToken.Claims.TryGetValue("email", out var email) && email is string emailStr
                ? emailStr
                : "";

            if (!string.IsNullOrEmpty(emailValue))
            {
                claims.Add(new Claim(ClaimTypes.Email, emailValue));
            }

            // Sync user to database
            var userService = context.RequestServices.GetRequiredService<IUserService>();
            var dbUser = await userService.GetOrCreateUserAsync(decodedToken.Uid, emailValue);
            claims.Add(new Claim("db_user_id", dbUser.Id.ToString()));

            var identity = new ClaimsIdentity(claims, "Firebase");
            context.User = new ClaimsPrincipal(identity);

            await _next(context);
        }
        catch (FirebaseAuthException ex)
        {
            _logger.LogWarning(ex, "Firebase token verification failed");
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "Invalid or expired token." });
        }
    }
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class FirebaseAuthorizeAttribute : Attribute;
