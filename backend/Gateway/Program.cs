using Microsoft.ServiceFabric.Services.Runtime;
using Putopis.Gateway;
using Putopis.Gateway.ServiceFabric;

if (Environment.GetEnvironmentVariable("Fabric_ApplicationName") is not null)
{
    await ServiceRuntime.RegisterServiceAsync(
        "Putopis.GatewayType",
        ctx => new GatewayStatelessService(ctx));
    await Task.Delay(Timeout.Infinite);
}
else
{
    var app = GatewayHost.Build(args);
    await app.RunAsync();
}
