using System.Fabric;
using Microsoft.ServiceFabric.Data;
using Putopis.Common.Auth;
using Putopis.Share.Storage;

namespace Putopis.Share;

public static class ShareHost
{
    public static WebApplication Build(
        string[] args,
        ServiceContext? sfContext = null,
        IReliableStateManager? stateManager = null,
        string? bindUrl = null)
    {
        var builder = WebApplication.CreateBuilder(args);
        if (sfContext is not null) builder.Services.AddSingleton(sfContext);

        builder.Services.AddPutopisJwt(builder.Configuration);

        if (stateManager is not null)
        {
            // SF mode: use replicated Reliable Dictionary
            builder.Services.AddSingleton(stateManager);
            builder.Services.AddSingleton<IShareTokenStore, ReliableDictionaryShareTokenStore>();
        }
        else
        {
            // Local dev mode: in-memory ConcurrentDictionary
            builder.Services.AddSingleton<IShareTokenStore, InMemoryShareTokenStore>();
        }

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        var storageLabel = stateManager is not null
            ? "service-fabric-reliable-dictionary"
            : "in-memory";
        app.MapGet("/health", () => Results.Ok(new { service = "share", status = "ok", storage = storageLabel }));

        // Periodic cleanup of expired tokens
        _ = Task.Run(async () =>
        {
            var store = app.Services.GetRequiredService<IShareTokenStore>();
            while (!app.Lifetime.ApplicationStopping.IsCancellationRequested)
            {
                try { await store.CleanupExpiredAsync(app.Lifetime.ApplicationStopping); }
                catch { /* ignore in background loop */ }
                await Task.Delay(TimeSpan.FromMinutes(5), app.Lifetime.ApplicationStopping);
            }
        });

        if (bindUrl is not null)
        {
            app.Urls.Clear();
            app.Urls.Add(bindUrl);
        }

        return app;
    }
}
