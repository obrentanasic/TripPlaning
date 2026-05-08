using System.Fabric;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace Putopis.Users.ServiceFabric;

internal sealed class UsersStatelessService : StatelessService
{
    public UsersStatelessService(StatelessServiceContext context) : base(context) { }

    protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
    {
        return new[]
        {
            new ServiceInstanceListener(serviceContext =>
                new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, _) =>
                    UsersHost.BuildAsync(Array.Empty<string>(), serviceContext, url)
                        .GetAwaiter().GetResult()))
        };
    }
}
