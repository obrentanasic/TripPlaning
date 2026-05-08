using Putopis.Share.Models;

namespace Putopis.Share.Storage;

/// <summary>
/// Token storage abstraction. Replaced with a Service Fabric Reliable Dictionary
/// implementation in Checkpoint 13; for now we use an in-memory ConcurrentDictionary.
/// </summary>
public interface IShareTokenStore
{
    Task<ShareTokenState> IssueAsync(Guid tripId, string accessLevel, Guid issuedByUserId, TimeSpan ttl, CancellationToken ct);

    Task<ShareTokenState?> GetAsync(string token, CancellationToken ct);

    Task<bool> RevokeAsync(string token, CancellationToken ct);

    Task<int> RevokeForTripAsync(Guid tripId, CancellationToken ct);

    Task CleanupExpiredAsync(CancellationToken ct);
}
