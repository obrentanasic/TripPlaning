using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Putopis.Common.Auth;
using Putopis.Trips.Auth;
using Putopis.Trips.Data;
using Putopis.Trips.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<TripsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("TripsDb")));

builder.Services.AddPutopisJwt(builder.Configuration);

// Add the share-token authentication scheme alongside JWT.
builder.Services
    .AddAuthentication() // JwtBearer was added by AddPutopisJwt above
    .AddScheme<ShareTokenSchemeOptions, ShareTokenAuthHandler>(
        ShareTokenAuthHandler.SchemeName, _ => { });

// Default policy: accept either JWT bearer or share-token scheme.
builder.Services.AddAuthorization(options =>
{
    options.DefaultPolicy = new AuthorizationPolicyBuilder(
            JwtBearerDefaults.AuthenticationScheme,
            ShareTokenAuthHandler.SchemeName)
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddMemoryCache();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

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

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { service = "trips", status = "ok" }));

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TripsDbContext>();
    await Putopis.Trips.Data.Seeder.SeedAsync(db);
}

app.Run();
