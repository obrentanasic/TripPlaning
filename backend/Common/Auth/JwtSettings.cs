namespace Putopis.Common.Auth;

public sealed class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "putopis";
    public string Audience { get; set; } = "putopis-clients";
    public string Secret { get; set; } = string.Empty;
    public int LifetimeHours { get; set; } = 24;
}
