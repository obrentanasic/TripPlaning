using System.Fabric;
using Putopis.Common.Auth;

namespace Putopis.Gateway;

public static class GatewayHost
{
    /// <summary>
    /// Builds the Gateway WebApplication. Used by both plain dotnet run and the
    /// StatelessService SF wrapper so DI registrations stay in one place.
    /// </summary>
    public static WebApplication Build(string[] args, ServiceContext? sfContext = null, string? bindUrl = null)
    {
        var builder = WebApplication.CreateBuilder(args);
        if (sfContext is not null) builder.Services.AddSingleton(sfContext);

        builder.Services.AddPutopisJwt(builder.Configuration);
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                var origins = builder.Configuration
                    .GetSection("Cors:AllowedOrigins")
                    .Get<string[]>() ?? new[] { "http://localhost:5173" };

                policy
                    .WithOrigins(origins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        builder.Services
            .AddReverseProxy()
            .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

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
        app.MapReverseProxy();
        app.MapGet("/health", () => Results.Ok(new { service = "gateway", status = "ok" }));

        if (bindUrl is not null)
        {
            app.Urls.Clear();
            app.Urls.Add(bindUrl);
        }

        return app;
    }
}
