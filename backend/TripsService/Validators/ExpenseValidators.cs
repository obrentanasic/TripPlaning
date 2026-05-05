using FluentValidation;
using Putopis.Trips.Dto;

namespace Putopis.Trips.Validators;

public class ExpenseCreateValidator : AbstractValidator<ExpenseCreateRequest>
{
    public ExpenseCreateValidator()
    {
        RuleFor(x => x.Naziv).NotEmpty().MaximumLength(200).WithMessage("Naziv troška je obavezan.");
        RuleFor(x => x.Kategorija).NotEmpty().MaximumLength(20)
            .Must(BeValidCategory).WithMessage("Nepoznata kategorija troška.");
        RuleFor(x => x.Iznos).GreaterThanOrEqualTo(0).WithMessage("Iznos ne može biti negativan.");
        RuleFor(x => x.Datum).Must(s => DateOnly.TryParse(s, out _)).WithMessage("Datum nije validan.");
        RuleFor(x => x.Opis).MaximumLength(500);
    }

    private static bool BeValidCategory(string s) =>
        s is "prevoz" or "smestaj" or "hrana" or "ulaznice" or "kupovina" or "ostalo";
}

public class ExpenseUpdateValidator : AbstractValidator<ExpenseUpdateRequest>
{
    public ExpenseUpdateValidator()
    {
        RuleFor(x => x.Naziv).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Kategorija).NotEmpty().MaximumLength(20)
            .Must(s => s is "prevoz" or "smestaj" or "hrana" or "ulaznice" or "kupovina" or "ostalo")
            .WithMessage("Nepoznata kategorija troška.");
        RuleFor(x => x.Iznos).GreaterThanOrEqualTo(0).WithMessage("Iznos ne može biti negativan.");
        RuleFor(x => x.Datum).Must(s => DateOnly.TryParse(s, out _)).WithMessage("Datum nije validan.");
        RuleFor(x => x.Opis).MaximumLength(500);
    }
}
