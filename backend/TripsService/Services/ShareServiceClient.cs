using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Putopis.Trips.Services;

public sealed class ShareIssueResultDto
{
    public string Token { get; set; } = string.Empty;
    public Guid TripId { get; set; }
    public string AccessLevel { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public sealed class ShareResolveResponseDto
{
    public string Token { get; set; } = string.Empty;
    public Guid TripId { get; set; }
    public string AccessLevel { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public sealed class ShareServiceClient
{
    public const string HttpClientName = "share";
    private readonly HttpClient _http;
    private readonly IConfiguration _config;

    public ShareServiceClient(IHttpClientFactory factory, IConfiguration config)
    {
        _http = factory.CreateClient(HttpClientName);
        _config = config;
    }

    public async Task<ShareIssueResultDto> IssueAsync(Guid tripId, string accessLevel, Guid issuedByUserId, CancellationToken ct)
    {
        using var msg = new HttpRequestMessage(HttpMethod.Post, "/api/share/internal/issue");
        AttachKey(msg);
        msg.Content = JsonContent.Create(new
        {
            tripId,
            accessLevel,
            issuedByUserId,
        });

        using var resp = await _http.SendAsync(msg, ct);
        resp.EnsureSuccessStatusCode();
        var dto = await resp.Content.ReadFromJsonAsync<ShareIssueResultDto>(cancellationToken: ct);
        return dto ?? throw new InvalidOperationException("Empty response from ShareService.");
    }

    public async Task<ShareResolveResponseDto?> ResolveAsync(string token, CancellationToken ct)
    {
        using var msg = new HttpRequestMessage(HttpMethod.Get, $"/api/share/{Uri.EscapeDataString(token)}");
        using var resp = await _http.SendAsync(msg, ct);
        if (resp.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
        resp.EnsureSuccessStatusCode();
        return await resp.Content.ReadFromJsonAsync<ShareResolveResponseDto>(cancellationToken: ct);
    }

    public async Task RevokeForTripAsync(Guid tripId, CancellationToken ct)
    {
        using var msg = new HttpRequestMessage(HttpMethod.Delete, $"/api/share/internal/trip/{tripId}");
        AttachKey(msg);
        using var resp = await _http.SendAsync(msg, ct);
        resp.EnsureSuccessStatusCode();
    }

    private void AttachKey(HttpRequestMessage msg)
    {
        var key = _config["Internal:ApiKey"]
            ?? throw new InvalidOperationException("Internal:ApiKey is not configured.");
        msg.Headers.Add("X-Internal-Key", key);
    }
}
