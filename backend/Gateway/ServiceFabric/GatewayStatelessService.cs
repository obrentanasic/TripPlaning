using System.Fabric;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace Putopis.Gateway.ServiceFabric;

/// <summary>
/// Stateless SF service that hosts the Gateway ASP.NET Core app inside a
/// Service Fabric cluster. Used in production deployments — local dev runs
/// the same WebApplication via plain dotnet run.
/// </summary>
internal sealed class GatewayStatelessService : StatelessService
{
    public GatewayStatelessService(StatelessServiceContext context) : base(context) { }

    protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
    {
        return new[]
        {
            new ServiceInstanceListener(serviceContext =>
                new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, _) =>
                    GatewayHost.Build(Array.Empty<string>(), serviceContext, url)))
        };
    }
}
