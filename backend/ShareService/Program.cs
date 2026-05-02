using Putopis.Common.Auth;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddPutopisJwt(builder.Configuration);
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

app.MapGet("/health", () => Results.Ok(new { service = "share", status = "ok", note = "stateful storage wired in Checkpoint 11" }));

app.Run();
