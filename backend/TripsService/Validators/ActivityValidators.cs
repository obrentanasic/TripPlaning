using FluentValidation;
using Putopis.Trips.Dto;

namespace Putopis.Trips.Validators;

public class ActivityCreateValidator : AbstractValidator<ActivityCreateRequest>
{
    public ActivityCreateValidator()
    {
        RuleFor(x => x.Naziv).NotEmpty().MaximumLength(200)
            .WithMessage("Naziv aktivnosti je obavezan.");
        RuleFor(x => x.Datum).Must(BeValidDate).WithMessage("Datum nije validan.");
        RuleFor(x => x.Vreme).Must(BeValidTime).WithMessage("Vreme nije validno (očekujem HH:mm).");
        RuleFor(x => x.Lokacija).MaximumLength(200);
        RuleFor(x => x.Opis).MaximumLength(2000);
        RuleFor(x => x.Trosak).GreaterThanOrEqualTo(0).WithMessage("Trošak ne može biti negativan.");
        RuleFor(x => x.Status).Must(BeValidStatus).WithMessage("Status mora biti planirano, rezervisano, završeno ili otkazano.");
    }

    private static bool BeValidDate(string s) => DateOnly.TryParse(s, out _);
    private static bool BeValidTime(string s) => TimeOnly.TryParse(s, out _);
    private static bool BeValidStatus(string s) =>
        s is "planirano" or "rezervisano" or "završeno" or "otkazano";
}

public class ActivityUpdateValidator : AbstractValidator<ActivityUpdateRequest>
{
    public ActivityUpdateValidator()
    {
        RuleFor(x => x.Naziv).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Datum).Must(s => DateOnly.TryParse(s, out _)).WithMessage("Datum nije validan.");
        RuleFor(x => x.Vreme).Must(s => TimeOnly.TryParse(s, out _)).WithMessage("Vreme nije validno (HH:mm).");
        RuleFor(x => x.Lokacija).MaximumLength(200);
        RuleFor(x => x.Opis).MaximumLength(2000);
        RuleFor(x => x.Trosak).GreaterThanOrEqualTo(0).WithMessage("Trošak ne može biti negativan.");
        RuleFor(x => x.Status).Must(s => s is "planirano" or "rezervisano" or "završeno" or "otkazano")
            .WithMessage("Status mora biti planirano, rezervisano, završeno ili otkazano.");
    }
}
