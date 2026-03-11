using Microsoft.EntityFrameworkCore;
using Stoxly.Api.Data;
using Stoxly.Api.Models;

namespace Stoxly.Api.Services;

public interface IUserService
{
    Task<User> GetOrCreateUserAsync(string firebaseUid, string email);
}

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<User> GetOrCreateUserAsync(string firebaseUid, string email)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

        if (user != null)
            return user;

        user = new User
        {
            FirebaseUid = firebaseUid,
            Email = email,
        };

        _db.Users.Add(user);

        var defaultPortfolio = new Portfolio
        {
            UserId = firebaseUid,
            Name = "My Portfolio",
            Description = "Default portfolio",
            BaseCurrency = "USD",
            IsDefault = true,
            CreatedAt = DateTime.UtcNow,
        };

        _db.Portfolios.Add(defaultPortfolio);
        await _db.SaveChangesAsync();

        return user;
    }
}
