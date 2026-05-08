using Putopis.Common.Auth;
using Putopis.Share.Storage;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddPutopisJwt(builder.Configuration);
builder.Services.AddSingleton<IShareTokenStore, InMemoryShareTokenStore>();

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

app.MapGet("/health", () => Results.Ok(new { service = "share", status = "ok", storage = "in-memory (Reliable Dictionary in Ckpt 13)" }));

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

app.Run();
