using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Putopis.Trips.Services;

namespace Putopis.Trips.Auth;

public sealed class ShareTokenSchemeOptions : AuthenticationSchemeOptions { }

/// <summary>
/// Allows requests to /api/trips/{tripId}/... when authenticated by a share token
/// (passed via the X-Share-Token header). Adds claims:
///   - NameIdentifier = tripId (so OwnedTrip helpers see "ownership" of just this trip)
///   - Role           = "share"
///   - tripId         = tripId (explicit)
///   - accessLevel    = view | edit
/// </summary>
public sealed class ShareTokenAuthHandler : AuthenticationHandler<ShareTokenSchemeOptions>
{
    public const string SchemeName = "ShareToken";
    public const string HeaderName = "X-Share-Token";

    private readonly ShareServiceClient _share;
    private readonly IMemoryCache _cache;

    public ShareTokenAuthHandler(
        IOptionsMonitor<ShareTokenSchemeOptions> options,
        ILoggerFactory loggerFactory,
        UrlEncoder encoder,
        ShareServiceClient share,
        IMemoryCache cache)
        : base(options, loggerFactory, encoder)
    {
        _share = share;
        _cache = cache;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(HeaderName, out var header) || string.IsNullOrWhiteSpace(header))
            return AuthenticateResult.NoResult();

        var token = header.ToString();
        var key = $"share:{token}";

        if (!_cache.TryGetValue<ShareResolveResponseDto>(key, out var resolved))
        {
            try
            {
                resolved = await _share.ResolveAsync(token, Context.RequestAborted);
            }
            catch (Exception ex)
            {
                Logger.LogWarning(ex, "Share token resolve call failed");
                return AuthenticateResult.Fail("Greška pri proveri share tokena.");
            }

            if (resolved is null)
                return AuthenticateResult.Fail("Share token nije validan ili je istekao.");

            _cache.Set(key, resolved, TimeSpan.FromMinutes(1));
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, resolved!.TripId.ToString()),
            new Claim(ClaimTypes.Role, "share"),
            new Claim("tripId", resolved.TripId.ToString()),
            new Claim("accessLevel", resolved.AccessLevel),
        };
        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        return AuthenticateResult.Success(new AuthenticationTicket(principal, SchemeName));
    }
}
