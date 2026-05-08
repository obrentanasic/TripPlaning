using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Putopis.Share.Auth;

/// <summary>
/// Gates server-to-server endpoints (TripsService → ShareService). Validates
/// X-Internal-Key against config:Internal:ApiKey. Replaced/strengthened by mTLS
/// in production; for the demo cluster a shared key is sufficient.
/// </summary>
public sealed class InternalApiKeyAttribute : ActionFilterAttribute
{
    public const string HeaderName = "X-Internal-Key";

    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var config = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        var expected = config["Internal:ApiKey"];

        if (string.IsNullOrWhiteSpace(expected))
        {
            context.Result = new ObjectResult(new { error = "Internal API key is not configured." })
            {
                StatusCode = StatusCodes.Status500InternalServerError
            };
            return;
        }

        if (!context.HttpContext.Request.Headers.TryGetValue(HeaderName, out var got)
            || !string.Equals(got.ToString(), expected, StringComparison.Ordinal))
        {
            context.Result = new UnauthorizedResult();
        }
    }
}
