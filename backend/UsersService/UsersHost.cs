using System.Fabric;
using Microsoft.EntityFrameworkCore;
using Putopis.Common.Auth;
using Putopis.Users.Data;
using Putopis.Users.Services;

namespace Putopis.Users;

public static class UsersHost
{
    public static async Task<WebApplication> BuildAsync(string[] args, ServiceContext? sfContext = null, string? bindUrl = null)
    {
        var builder = WebApplication.CreateBuilder(args);
        if (sfContext is not null) builder.Services.AddSingleton(sfContext);

        builder.Services.AddDbContext<UsersDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("UsersDb")));

        builder.Services.AddPutopisJwt(builder.Configuration);
        builder.Services.AddScoped<AuthService>();

        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                var origins = builder.Configuration
                    .GetSection("Cors:AllowedOrigins")
                    .Get<string[]>() ?? new[] { "http://localhost:5173" };
                policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
            });
        });

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.MapGet("/health", () => Results.Ok(new { service = "users", status = "ok" }));

        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<UsersDbContext>();
            await Seeder.SeedAsync(db);
        }

        if (bindUrl is not null)
        {
            app.Urls.Clear();
            app.Urls.Add(bindUrl);
        }

        return app;
    }
}
