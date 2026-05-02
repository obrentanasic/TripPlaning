using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Putopis.Common.Auth;

public static class AuthExtensions
{
    public static IServiceCollection AddPutopisJwt(this IServiceCollection services, IConfiguration configuration)
    {
        var settings = new JwtSettings();
        configuration.GetSection(JwtSettings.SectionName).Bind(settings);

        if (string.IsNullOrWhiteSpace(settings.Secret))
        {
            throw new InvalidOperationException("Jwt:Secret is not configured.");
        }

        services.AddSingleton(settings);
        services.AddSingleton<JwtTokenService>();

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = settings.Issuer,
                    ValidAudience = settings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Secret)),
                    ClockSkew = TimeSpan.FromSeconds(30)
                };
            });

        services.AddAuthorization();

        return services;
    }
}
