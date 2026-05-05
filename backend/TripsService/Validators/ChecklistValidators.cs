using FluentValidation;
using Putopis.Trips.Dto;

namespace Putopis.Trips.Validators;

public class ChecklistCreateValidator : AbstractValidator<ChecklistCreateRequest>
{
    public ChecklistCreateValidator()
    {
        RuleFor(x => x.Naziv).NotEmpty().MaximumLength(200).WithMessage("Naziv stavke je obavezan.");
        RuleFor(x => x.Kategorija).NotEmpty().MaximumLength(20)
            .Must(BeValidCategory).WithMessage("Nepoznata kategorija checkliste.");
    }

    private static bool BeValidCategory(string s) =>
        s is "dokumenti" or "tehnika" or "garderoba" or "higijena" or "ostalo";
}

public class ChecklistUpdateValidator : AbstractValidator<ChecklistUpdateRequest>
{
    public ChecklistUpdateValidator()
    {
        RuleFor(x => x.Naziv).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Kategorija).NotEmpty().MaximumLength(20)
            .Must(s => s is "dokumenti" or "tehnika" or "garderoba" or "higijena" or "ostalo")
            .WithMessage("Nepoznata kategorija checkliste.");
    }
}
