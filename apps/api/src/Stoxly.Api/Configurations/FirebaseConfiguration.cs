using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Logging;

namespace Stoxly.Api.Configurations;

public static class FirebaseConfiguration
{
    public static void AddFirebase(this IServiceCollection services, IConfiguration configuration)
    {
        if (FirebaseApp.DefaultInstance != null) return;

        var credentialPath = configuration["Firebase:CredentialPath"];

        try
        {
            if (!string.IsNullOrEmpty(credentialPath))
            {
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.FromFile(credentialPath),
                    ProjectId = configuration["Firebase:ProjectId"],
                });
            }
            else
            {
                // Falls back to GOOGLE_APPLICATION_CREDENTIALS environment variable
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.GetApplicationDefault(),
                    ProjectId = configuration["Firebase:ProjectId"],
                });
            }
        }
        catch (Exception ex)
        {
            // Log and continue — Firebase auth middleware will reject requests if not initialized
            var sp = services.BuildServiceProvider();
            var logger = sp.GetRequiredService<ILoggerFactory>().CreateLogger("FirebaseConfiguration");
            logger.LogWarning(ex, "Firebase credentials not found. Auth will be unavailable until credentials are configured.");
        }
    }
}
