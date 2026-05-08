namespace Putopis.Common.Dto.Auth;

public sealed class StatusUpdateRequest
{
    public string Status { get; set; } = "aktivan"; // aktivan | suspendovan
}
