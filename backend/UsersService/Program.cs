using Microsoft.ServiceFabric.Services.Runtime;
using Putopis.Users;
using Putopis.Users.ServiceFabric;

if (Environment.GetEnvironmentVariable("Fabric_ApplicationName") is not null)
{
    await ServiceRuntime.RegisterServiceAsync(
        "Putopis.UsersType",
        ctx => new UsersStatelessService(ctx));
    await Task.Delay(Timeout.Infinite);
}
else
{
    var app = await UsersHost.BuildAsync(args);
    await app.RunAsync();
}
