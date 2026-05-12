using Microsoft.ServiceFabric.Services.Runtime;
using Putopis.Trips;
using Putopis.Trips.ServiceFabric;

if (Environment.GetEnvironmentVariable("Fabric_ApplicationName") is not null)
{
    await ServiceRuntime.RegisterServiceAsync(
        "Putopis.TripsType",
        ctx => new TripsStatelessService(ctx));
    await Task.Delay(Timeout.Infinite);
}
else
{
    var app = await TripsHost.BuildAsync(args);
    await app.RunAsync();
}
