using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

namespace Stoxly.Api.Configurations;

public static class FirebaseConfiguration
{
    public static void AddFirebase(this IServiceCollection services, IConfiguration configuration)
    {
        if (FirebaseApp.DefaultInstance != null) return;

        var credentialPath = configuration["Firebase:CredentialPath"];

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
}
