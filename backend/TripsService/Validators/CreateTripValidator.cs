using FluentValidation;
using Putopis.Trips.Dto;

namespace Putopis.Trips.Validators;

public class CreateTripValidator : AbstractValidator<CreateTripRequest>
{
    public CreateTripValidator()
    {
        RuleFor(x => x.Naziv)
            .NotEmpty().WithMessage("Naziv je obavezan.")
            .MaximumLength(200);

        RuleFor(x => x.Pocetak)
            .NotEmpty().WithMessage("Početni datum je obavezan.")
            .Must(BeValidDate).WithMessage("Početni datum nije validan.");

        RuleFor(x => x.Kraj)
            .NotEmpty().WithMessage("Krajnji datum je obavezan.")
            .Must(BeValidDate).WithMessage("Krajnji datum nije validan.");

        RuleFor(x => x)
            .Must(x => KrajGreaterOrEqualPocetak(x.Pocetak, x.Kraj))
            .WithMessage("Krajnji datum ne može biti pre početnog datuma.")
            .WithName("Kraj")
            .When(x => BeValidDate(x.Pocetak) && BeValidDate(x.Kraj));

        RuleFor(x => x.Budzet)
            .GreaterThanOrEqualTo(0).WithMessage("Budžet mora biti veći ili jednak nuli.");

        RuleFor(x => x.Valuta)
            .NotEmpty().WithMessage("Valuta je obavezna.")
            .MaximumLength(8);

        RuleFor(x => x.Opis).MaximumLength(2000);
        RuleFor(x => x.Napomene).MaximumLength(2000);
        RuleFor(x => x.Kover).MaximumLength(500);
        RuleFor(x => x.Boja).MaximumLength(20);
    }

    private static bool BeValidDate(string value) =>
        DateOnly.TryParse(value, out _);

    private static bool KrajGreaterOrEqualPocetak(string pocetak, string kraj) =>
        DateOnly.TryParse(pocetak, out var p) &&
        DateOnly.TryParse(kraj, out var k) &&
        k >= p;
}
