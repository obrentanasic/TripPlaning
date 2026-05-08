namespace Putopis.Share.Dto;

public sealed class IssueShareRequest
{
    public Guid TripId { get; set; }
    public string AccessLevel { get; set; } = "view"; // view | edit
    public Guid IssuedByUserId { get; set; }
    public int? TtlDays { get; set; }
}

public sealed class IssueShareResponse
{
    public string Token { get; set; } = string.Empty;
    public Guid TripId { get; set; }
    public string AccessLevel { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
}

public sealed class ShareInfoResponse
{
    public string Token { get; set; } = string.Empty;
    public Guid TripId { get; set; }
    public string AccessLevel { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
