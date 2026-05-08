using System.Security.Cryptography;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using Putopis.Share.Models;

namespace Putopis.Share.Storage;

/// <summary>
/// Service Fabric Reliable Dictionary–backed token store. Used when the
/// process is hosted inside a StatefulService — the dictionary is replicated
/// across cluster nodes and survives node restarts.
/// </summary>
public sealed class ReliableDictionaryShareTokenStore : IShareTokenStore
{
    private const string DictionaryName = "ShareTokens";
    private readonly IReliableStateManager _stateManager;

    public ReliableDictionaryShareTokenStore(IReliableStateManager stateManager)
    {
        _stateManager = stateManager;
    }

    private Task<IReliableDictionary<string, ShareTokenState>> GetDictAsync()
        => _stateManager.GetOrAddAsync<IReliableDictionary<string, ShareTokenState>>(DictionaryName);

    public async Task<ShareTokenState> IssueAsync(Guid tripId, string accessLevel, Guid issuedByUserId, TimeSpan ttl, CancellationToken ct)
    {
        var dict = await GetDictAsync();
        var token = GenerateToken();
        var now = DateTime.UtcNow;
        var state = new ShareTokenState
        {
            Token = token,
            TripId = tripId,
            AccessLevel = accessLevel,
            IssuedByUserId = issuedByUserId,
            IssuedAt = now,
            ExpiresAt = now.Add(ttl),
        };

        using var tx = _stateManager.CreateTransaction();
        await dict.SetAsync(tx, token, state);
        await tx.CommitAsync();

        return state;
    }

    public async Task<ShareTokenState?> GetAsync(string token, CancellationToken ct)
    {
        var dict = await GetDictAsync();
        using var tx = _stateManager.CreateTransaction();
        var got = await dict.TryGetValueAsync(tx, token);
        if (!got.HasValue) return null;

        var state = got.Value;
        if (state.IsExpired(DateTime.UtcNow))
        {
            await dict.TryRemoveAsync(tx, token);
            await tx.CommitAsync();
            return null;
        }

        return state;
    }

    public async Task<bool> RevokeAsync(string token, CancellationToken ct)
    {
        var dict = await GetDictAsync();
        using var tx = _stateManager.CreateTransaction();
        var removed = await dict.TryRemoveAsync(tx, token);
        await tx.CommitAsync();
        return removed.HasValue;
    }

    public async Task<int> RevokeForTripAsync(Guid tripId, CancellationToken ct)
    {
        var dict = await GetDictAsync();
        var removed = 0;

        using var tx = _stateManager.CreateTransaction();
        var enumerable = await dict.CreateEnumerableAsync(tx);
        var toRemove = new List<string>();
        var enumerator = enumerable.GetAsyncEnumerator();
        while (await enumerator.MoveNextAsync(ct))
        {
            if (enumerator.Current.Value.TripId == tripId)
                toRemove.Add(enumerator.Current.Key);
        }
        foreach (var k in toRemove)
        {
            var r = await dict.TryRemoveAsync(tx, k);
            if (r.HasValue) removed++;
        }
        await tx.CommitAsync();

        return removed;
    }

    public async Task CleanupExpiredAsync(CancellationToken ct)
    {
        var dict = await GetDictAsync();
        var now = DateTime.UtcNow;

        using var tx = _stateManager.CreateTransaction();
        var enumerable = await dict.CreateEnumerableAsync(tx);
        var toRemove = new List<string>();
        var enumerator = enumerable.GetAsyncEnumerator();
        while (await enumerator.MoveNextAsync(ct))
        {
            if (enumerator.Current.Value.IsExpired(now))
                toRemove.Add(enumerator.Current.Key);
        }
        foreach (var k in toRemove) await dict.TryRemoveAsync(tx, k);
        await tx.CommitAsync();
    }

    private static string GenerateToken()
    {
        Span<byte> bytes = stackalloc byte[16];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes)
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }
}
