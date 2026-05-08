using System.Fabric;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace Putopis.Share.ServiceFabric;

/// <summary>
/// Stateful SF service that hosts the Share API and persists share tokens in
/// a replicated Reliable Dictionary. The state manager is exposed to DI so the
/// IShareTokenStore implementation can read/write the dictionary inside SF
/// transactions.
/// </summary>
internal sealed class ShareStatefulService : StatefulService
{
    public ShareStatefulService(StatefulServiceContext context) : base(context) { }

    protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
    {
        return new[]
        {
            new ServiceReplicaListener(serviceContext =>
                new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, _) =>
                    ShareHost.Build(Array.Empty<string>(), serviceContext, this.StateManager, url)))
        };
    }
}
