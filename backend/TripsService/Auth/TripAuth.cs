using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Putopis.Trips.Data;
using Putopis.Trips.Data.Entities;

namespace Putopis.Trips.Auth;

public static class TripAuth
{
    public static bool IsShareUser(this ClaimsPrincipal user) => user.IsInRole("share");

    public static string? AccessLevel(this ClaimsPrincipal user) =>
        user.FindFirstValue("accessLevel");

    public static bool IsShareReadOnly(this ClaimsPrincipal user) =>
        user.IsShareUser() && user.AccessLevel() != "edit";

    /// <summary>
    /// Resolves the trip the caller is authorized to operate on.
    /// JWT path: trip must belong to the calling user.
    /// Share-token path: trip id must equal the token's trip id.
    /// </summary>
    public static async Task<TripEntity?> AuthorizedTripAsync(
        this ControllerBase controller, TripsDbContext db, Guid tripId, CancellationToken ct)
    {
        var user = controller.User;
        if (user.IsShareUser())
        {
            var claimedTripId = user.FindFirstValue("tripId");
            if (!Guid.TryParse(claimedTripId, out var t) || t != tripId) return null;
            return await db.Trips.FirstOrDefaultAsync(x => x.Id == tripId, ct);
        }

        var sub = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(sub, out var userId)) return null;
        return await db.Trips.FirstOrDefaultAsync(x => x.Id == tripId && x.UserId == userId, ct);
    }
}
