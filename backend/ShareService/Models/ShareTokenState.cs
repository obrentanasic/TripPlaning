namespace Putopis.Share.Models;

public sealed class ShareTokenState
{
    public string Token { get; set; } = string.Empty;
    public Guid TripId { get; set; }
    public string AccessLevel { get; set; } = "view"; // view | edit
    public Guid IssuedByUserId { get; set; }
    public DateTime IssuedAt { get; set; }
    public DateTime ExpiresAt { get; set; }

    public bool IsExpired(DateTime now) => now >= ExpiresAt;
}
