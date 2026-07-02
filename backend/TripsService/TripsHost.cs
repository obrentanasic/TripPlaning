using System.Fabric;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Putopis.Common.Auth;
using Putopis.Trips.Auth;
using Putopis.Trips.Data;
using Putopis.Trips.Services;

namespace Putopis.Trips;

public static class TripsHost
{
    public static async Task<WebApplication> BuildAsync(string[] args, ServiceContext? sfContext = null, string? bindUrl = null)
    {
        var builder = WebApplication.CreateBuilder(args);
        if (sfContext is not null) builder.Services.AddSingleton(sfContext);

        builder.Services.AddDbContext<TripsDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("TripsDb")));

        builder.Services.AddPutopisJwt(builder.Configuration);

        builder.Services
            .AddAuthentication()
            .AddScheme<ShareTokenSchemeOptions, ShareTokenAuthHandler>(
                ShareTokenAuthHandler.SchemeName, _ => { });

        builder.Services.AddAuthorization(options =>
        {
            options.DefaultPolicy = new AuthorizationPolicyBuilder(
                    JwtBearerDefaults.AuthenticationScheme,
                    ShareTokenAuthHandler.SchemeName)
                .RequireAuthenticatedUser()
                .Build();
        });

        builder.Services.AddMemoryCache();
        builder.Services.AddValidatorsFromAssemblyContaining(typeof(TripsHost));

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

        builder.Services.AddHttpClient(ShareServiceClient.HttpClientName, c =>
        {
            var url = builder.Configuration["Services:Share"] ?? "http://localhost:8083";
            c.BaseAddress = new Uri(url);
            c.Timeout = TimeSpan.FromSeconds(5);
        });
        builder.Services.AddScoped<ShareServiceClient>();

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
        app.MapGet("/health", () => Results.Ok(new { service = "trips", status = "ok" }));

        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<TripsDbContext>();
            await Putopis.Trips.Data.Seeder.SeedAsync(db);
        }

        if (bindUrl is not null)
        {
            app.Urls.Clear();
            app.Urls.Add(bindUrl);
        }

        return app;
    }
}
