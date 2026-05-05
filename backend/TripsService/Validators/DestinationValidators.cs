using FluentValidation;
using Putopis.Trips.Dto;

namespace Putopis.Trips.Validators;

public class DestinationCreateValidator : AbstractValidator<DestinationCreateRequest>
{
    public DestinationCreateValidator()
    {
        RuleFor(x => x.Naziv).NotEmpty().MaximumLength(200)
            .WithMessage("Naziv destinacije je obavezan.");
        RuleFor(x => x.Lokacija).NotEmpty().MaximumLength(200)
            .WithMessage("Lokacija je obavezna.");
        RuleFor(x => x.Dolazak).Must(BeValidDate).WithMessage("Datum dolaska nije validan.");
        RuleFor(x => x.Odlazak).Must(BeValidDate).WithMessage("Datum odlaska nije validan.");
        RuleFor(x => x).Must(x => DateOnly.Parse(x.Odlazak) >= DateOnly.Parse(x.Dolazak))
            .WithMessage("Datum odlaska ne može biti pre datuma dolaska.")
            .WithName("Odlazak")
            .When(x => BeValidDate(x.Dolazak) && BeValidDate(x.Odlazak));
        RuleFor(x => x.Opis).MaximumLength(2000);
        RuleFor(x => x.Foto).MaximumLength(500);
    }

    private static bool BeValidDate(string s) => DateOnly.TryParse(s, out _);
}

public class DestinationUpdateValidator : AbstractValidator<DestinationUpdateRequest>
{
    public DestinationUpdateValidator()
    {
        RuleFor(x => x.Naziv).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Lokacija).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Dolazak).Must(s => DateOnly.TryParse(s, out _)).WithMessage("Datum dolaska nije validan.");
        RuleFor(x => x.Odlazak).Must(s => DateOnly.TryParse(s, out _)).WithMessage("Datum odlaska nije validan.");
        RuleFor(x => x).Must(x => DateOnly.Parse(x.Odlazak) >= DateOnly.Parse(x.Dolazak))
            .WithMessage("Datum odlaska ne može biti pre datuma dolaska.")
            .WithName("Odlazak")
            .When(x => DateOnly.TryParse(x.Dolazak, out _) && DateOnly.TryParse(x.Odlazak, out _));
        RuleFor(x => x.Opis).MaximumLength(2000);
        RuleFor(x => x.Foto).MaximumLength(500);
    }
}
