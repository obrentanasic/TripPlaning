using Microsoft.ServiceFabric.Services.Runtime;
using Putopis.Share;
using Putopis.Share.ServiceFabric;

if (Environment.GetEnvironmentVariable("Fabric_ApplicationName") is not null)
{
    await ServiceRuntime.RegisterServiceAsync(
        "Putopis.ShareType",
        ctx => new ShareStatefulService(ctx));
    await Task.Delay(Timeout.Infinite);
}
else
{
    var app = ShareHost.Build(args);
    await app.RunAsync();
}
