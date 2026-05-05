using Microsoft.EntityFrameworkCore;
using Putopis.Trips.Data.Entities;

namespace Putopis.Trips.Data;

public static class Seeder
{
    private static readonly Guid LanaId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid MarkoId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    public static async Task SeedAsync(TripsDbContext db, CancellationToken ct = default)
    {
        await db.Database.MigrateAsync(ct);
        if (await db.Trips.AnyAsync(ct)) return;

        var japan = BuildJapan();
        var prag = BuildPrag();
        var lisabon = BuildLisabon();

        db.Trips.AddRange(japan, prag, lisabon);
        await db.SaveChangesAsync(ct);
    }

    private static TripEntity BuildJapan()
    {
        var t = new TripEntity
        {
            Id = Guid.Parse("aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa"),
            UserId = LanaId,
            Naziv = "Japan: Tokyo, Kyoto i Osaka",
            Opis = "Dvonedeljno putovanje kroz tri grada — od neonskog Tokija do hramova Kjota i kuhinje Osake.",
            Pocetak = new DateOnly(2026, 4, 8),
            Kraj = new DateOnly(2026, 4, 21),
            Budzet = 4800m,
            Valuta = "EUR",
            Kover = "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200&q=80",
            Boja = "terra",
            Napomene = "Rezervisati JR Pass pre polaska. Proveriti vize.",
        };

        var d1 = NewDest(t, "Tokio", "Tokyo, Japan", "2026-04-08", "2026-04-13",
            "Shibuya, Shinjuku, Asakusa, Akihabara. Smeštaj u Shinjuku.",
            "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80");
        var d2 = NewDest(t, "Kjoto", "Kyoto, Japan", "2026-04-13", "2026-04-17",
            "Fushimi Inari, Arashiyama bambusova šuma, Kinkaku-ji.",
            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80");
        var d3 = NewDest(t, "Osaka", "Osaka, Japan", "2026-04-17", "2026-04-21",
            "Dotonbori, Osaka Castle, dnevni izlet u Naru.",
            "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80");
        t.Destinacije.AddRange(new[] { d1, d2, d3 });

        var acts = new (DestinationEntity dest, string n, string d, string v, string l, string o, decimal tr, string s)[]
        {
            (d1, "Sletanje na Narita aerodrom", "2026-04-08", "14:30", "NRT Terminal 1", "Narita Express do hotela.", 30, "rezervisano"),
            (d1, "Šetnja kroz Shibuya Crossing", "2026-04-09", "10:00", "Shibuya", "Hachiko spomenik, Shibuya Sky.", 25, "planirano"),
            (d1, "Sushi u Tsukiji marketu", "2026-04-09", "13:00", "Tsukiji Outer Market", "Doručak / rana večera.", 45, "planirano"),
            (d1, "Robot show u Shinjuku", "2026-04-09", "20:00", "Kabukicho", "", 60, "rezervisano"),
            (d1, "TeamLab Planets", "2026-04-10", "11:00", "Toyosu", "Imerzivna umetnička instalacija.", 35, "rezervisano"),
            (d1, "Asakusa & Senso-ji hram", "2026-04-11", "09:00", "Asakusa", "", 0, "planirano"),
            (d1, "Akihabara — elektronika", "2026-04-12", "15:00", "Akihabara", "", 80, "planirano"),
            (d2, "Shinkansen Tokio → Kjoto", "2026-04-13", "08:30", "Tokyo Station", "Pokriveno JR Passom.", 0, "rezervisano"),
            (d2, "Fushimi Inari Taisha", "2026-04-14", "07:00", "Fushimi", "Rano radi izbegavanja gužve.", 0, "planirano"),
            (d2, "Arashiyama bambusova šuma", "2026-04-15", "09:00", "Arashiyama", "I Tenryu-ji hram.", 8, "planirano"),
            (d2, "Tea ceremonija u Gionu", "2026-04-16", "15:00", "Gion", "", 55, "rezervisano"),
            (d3, "Voz Kjoto → Osaka", "2026-04-17", "10:00", "Kyoto Station", "", 0, "rezervisano"),
            (d3, "Dotonbori — street food", "2026-04-17", "19:00", "Dotonbori", "Takoyaki, okonomiyaki.", 40, "planirano"),
            (d3, "Osaka Castle", "2026-04-18", "10:00", "Osaka-jo", "", 6, "planirano"),
            (d3, "Dnevni izlet u Naru", "2026-04-19", "08:00", "Nara Park", "Hraniti jelene.", 25, "planirano"),
            (d3, "Universal Studios Japan", "2026-04-20", "09:00", "USJ", "", 95, "planirano"),
            (d3, "Povratak — Kansai aerodrom", "2026-04-21", "12:00", "KIX", "", 35, "rezervisano"),
        };
        foreach (var a in acts) t.Aktivnosti.Add(NewActivity(t, a.dest, a.n, a.d, a.v, a.l, a.o, a.tr, a.s));

        var exps = new (string n, string k, decimal i, string d, string o)[]
        {
            ("Avionske karte (povratne)", "prevoz", 1240, "2026-02-01", "Lufthansa preko Frankfurta"),
            ("JR Pass 14 dana", "prevoz", 460, "2026-03-15", ""),
            ("Hotel Shinjuku (5 noći)", "smestaj", 680, "2026-03-20", "Booking.com"),
            ("Ryokan Kjoto (4 noći)", "smestaj", 520, "2026-03-20", ""),
            ("Apartman Osaka (4 noći)", "smestaj", 380, "2026-03-22", "Airbnb"),
            ("TeamLab Planets ulaznice", "ulaznice", 35, "2026-03-25", ""),
            ("Universal Studios Japan", "ulaznice", 95, "2026-03-28", ""),
            ("Putno osiguranje", "ostalo", 85, "2026-03-10", ""),
            ("eSIM 14 dana", "ostalo", 28, "2026-04-01", ""),
        };
        foreach (var e in exps) t.Troskovi.Add(NewExpense(t, e.n, e.k, e.i, e.d, e.o));

        var chk = new (string n, string k, bool z)[]
        {
            ("Pasoš (proveriti rok)", "dokumenti", true),
            ("Avionska karta — printati", "dokumenti", true),
            ("Putno osiguranje", "dokumenti", true),
            ("JR Pass voucher", "dokumenti", false),
            ("Univerzalni adapter (tip A)", "tehnika", true),
            ("Powerbank", "tehnika", false),
            ("Kamera + dodatne baterije", "tehnika", false),
            ("Udobne patike za hodanje", "garderoba", true),
            ("Lagana jakna (april = ~15°C)", "garderoba", false),
            ("Kišobran", "garderoba", false),
            ("Lijekovi i prva pomoć", "higijena", false),
            ("Kontaktna sočiva + naočale", "higijena", true),
        };
        foreach (var c in chk) t.Checklist.Add(NewChecklist(t, c.n, c.k, c.z));

        t.Saradnici.Add(NewCollab(t, "Marko Petrović", "marko@email.com", "edit"));
        t.Saradnici.Add(NewCollab(t, "Ana Jovanović", "ana@email.com", "view"));

        return t;
    }

    private static TripEntity BuildPrag()
    {
        var t = new TripEntity
        {
            Id = Guid.Parse("bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb"),
            UserId = LanaId,
            Naziv = "Vikend u Pragu",
            Opis = "Brz vikend izlet — Stari grad, Karlov most, lokalna piva.",
            Pocetak = new DateOnly(2026, 5, 22),
            Kraj = new DateOnly(2026, 5, 25),
            Budzet = 650m,
            Valuta = "EUR",
            Kover = "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80",
            Boja = "forest",
            Napomene = "",
        };
        t.Destinacije.Add(NewDest(t, "Prag", "Prague, Czech Republic",
            "2026-05-22", "2026-05-25", "", null));
        t.Troskovi.Add(NewExpense(t, "Avionske karte", "prevoz", 180, "2026-04-10", ""));
        t.Troskovi.Add(NewExpense(t, "Hotel (3 noći)", "smestaj", 240, "2026-04-12", ""));
        return t;
    }

    private static TripEntity BuildLisabon()
    {
        return new TripEntity
        {
            Id = Guid.Parse("cccccccc-3333-3333-3333-cccccccccccc"),
            UserId = LanaId,
            Naziv = "Lisabon ljeto 2026",
            Opis = "U planu — još istražujemo destinaciju.",
            Pocetak = new DateOnly(2026, 7, 15),
            Kraj = new DateOnly(2026, 7, 22),
            Budzet = 1400m,
            Valuta = "EUR",
            Kover = "https://images.unsplash.com/photo-1588535401305-da8d2db14e69?w=1200&q=80",
            Boja = "gold",
            Napomene = "",
        };
    }

    private static DestinationEntity NewDest(TripEntity t, string naziv, string lok, string dol, string odl, string opis, string? foto)
        => new()
        {
            Id = Guid.NewGuid(),
            Trip = t,
            Naziv = naziv,
            Lokacija = lok,
            Dolazak = DateOnly.Parse(dol),
            Odlazak = DateOnly.Parse(odl),
            Opis = opis,
            Foto = foto,
        };

    private static ActivityEntity NewActivity(TripEntity t, DestinationEntity d, string naziv, string datum, string vreme, string lok, string opis, decimal trosak, string status)
        => new()
        {
            Id = Guid.NewGuid(),
            Trip = t,
            DestinationId = d.Id,
            Naziv = naziv,
            Datum = DateOnly.Parse(datum),
            Vreme = TimeOnly.Parse(vreme),
            Lokacija = lok,
            Opis = opis,
            Trosak = trosak,
            Status = status,
        };

    private static ExpenseEntity NewExpense(TripEntity t, string naziv, string kat, decimal iznos, string datum, string opis)
        => new()
        {
            Id = Guid.NewGuid(),
            Trip = t,
            Naziv = naziv,
            Kategorija = kat,
            Iznos = iznos,
            Datum = DateOnly.Parse(datum),
            Opis = opis,
        };

    private static ChecklistItemEntity NewChecklist(TripEntity t, string naziv, string kat, bool z)
        => new()
        {
            Id = Guid.NewGuid(),
            Trip = t,
            Naziv = naziv,
            Kategorija = kat,
            Zavrseno = z,
        };

    private static CollaboratorEntity NewCollab(TripEntity t, string ime, string email, string uloga)
        => new()
        {
            Id = Guid.NewGuid(),
            Trip = t,
            Ime = ime,
            Email = email,
            Uloga = uloga,
        };
}
