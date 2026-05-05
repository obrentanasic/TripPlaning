using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Putopis.Common.Auth;
using Putopis.Trips.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<TripsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("TripsDb")));

builder.Services.AddPutopisJwt(builder.Configuration);
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

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
