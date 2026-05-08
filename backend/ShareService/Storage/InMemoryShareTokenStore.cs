using System.Collections.Concurrent;
using System.Security.Cryptography;
using Putopis.Share.Models;

namespace Putopis.Share.Storage;

public sealed class InMemoryShareTokenStore : IShareTokenStore
{
    private readonly ConcurrentDictionary<string, ShareTokenState> _store = new(StringComparer.OrdinalIgnoreCase);

    public Task<ShareTokenState> IssueAsync(Guid tripId, string accessLevel, Guid issuedByUserId, TimeSpan ttl, CancellationToken ct)
    {
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
        _store[token] = state;
        return Task.FromResult(state);
    }

    public Task<ShareTokenState?> GetAsync(string token, CancellationToken ct)
    {
        if (!_store.TryGetValue(token, out var s)) return Task.FromResult<ShareTokenState?>(null);
        if (s.IsExpired(DateTime.UtcNow))
        {
            _store.TryRemove(token, out _);
            return Task.FromResult<ShareTokenState?>(null);
        }
        return Task.FromResult<ShareTokenState?>(s);
    }

    public Task<bool> RevokeAsync(string token, CancellationToken ct) =>
        Task.FromResult(_store.TryRemove(token, out _));

    public Task<int> RevokeForTripAsync(Guid tripId, CancellationToken ct)
    {
        var removed = 0;
        foreach (var kv in _store.Where(p => p.Value.TripId == tripId).ToArray())
        {
            if (_store.TryRemove(kv.Key, out _)) removed++;
        }
        return Task.FromResult(removed);
    }

    public Task CleanupExpiredAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        foreach (var kv in _store.Where(p => p.Value.IsExpired(now)).ToArray())
        {
            _store.TryRemove(kv.Key, out _);
        }
        return Task.CompletedTask;
    }

    private static string GenerateToken()
    {
        // 16 bytes -> 22 chars base64url; URL-safe and compact
        Span<byte> bytes = stackalloc byte[16];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes)
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }
}
