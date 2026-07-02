# Putopis — Trip Planning Web Application

Web aplikacija za planiranje putovanja: planovi, destinacije, dnevni raspored, troškovi, lista pakovanja, deljenje plana preko QR koda.

Predmetni projekat za predmet **Primena veb programiranja u infrastrukturnim sistemima** (FTN). Specifikacija u [pugs.pdf](pugs.pdf), arhitektura i use case dijagrami u [docs/](docs/).

![status](https://img.shields.io/badge/build-passing-brightgreen) ![sf](https://img.shields.io/badge/Service%20Fabric-stateful%20%2B%20stateless-blue) ![mssql](https://img.shields.io/badge/MS%20SQL-LocalDB-red)

---

## Arhitektura

- **Frontend** — React 18 + TypeScript (Vite), Context API, vanilla CSS, axios servisi injektovani kroz `useService` Context.
- **Backend** — 4 Microsoft Service Fabric mikroservisa na MS SQL Serveru:
  - **Gateway** (`stateless`) — javni ulaz na portu 8080, JWT validacija, CORS, YARP reverse proxy.
  - **UsersService** (`stateless`) — auth, registracija, BCrypt hash + JWT issuance, admin user management.
  - **TripsService** (`stateless`) — planovi, destinacije, aktivnosti, troškovi, checklist (kaskadno brisanje na sve dete entitete).
  - **ShareService** (`stateful`) — share tokeni u replikovanom Reliable Dictionary-ju, VIEW/EDIT pristup, 7-day TTL.

Detalji u [docs/architecture.md](docs/architecture.md). REST referenca u [docs/api.md](docs/api.md). Use cases u [docs/usecase.md](docs/usecase.md).

## Struktura repoa

```
PUGS/
├── frontend/      React + Vite SPA (TypeScript)
├── backend/       .NET 8 solution (Putopis.sln)
│   ├── Common/                      shared library (DTOs, JWT, BCrypt)
│   ├── Gateway/                     stateless SF service + YARP
│   ├── UsersService/                stateless SF service + EF Core (Putopis_Users DB)
│   ├── TripsService/                stateless SF service + EF Core (Putopis_Trips DB)
│   ├── ShareService/                stateful  SF service + Reliable Dictionary
│   └── PutopisCluster/              .sfproj application package
├── docs/                            arhitektura, use case, API
└── pugs.pdf                         originalna specifikacija
```

---

## Pokretanje

### Preduslovi

- [.NET 8 SDK](https://dotnet.microsoft.com/download) (ili .NET 9 SDK — solution targetira `net8.0`)
- [SQL Server LocalDB](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb) (instanca `MSSQLLocalDB`)
- [Node.js 20+](https://nodejs.org/) i npm
- `dotnet ef` global tool: `dotnet tool install --global dotnet-ef`
- (Opciono, za pravu SF deployment) [Visual Studio 2022](https://visualstudio.microsoft.com/) sa **Azure development** workload-om i [Service Fabric SDK](https://learn.microsoft.com/en-us/azure/service-fabric/service-fabric-get-started)

### 1. Inicijalna baza

EF Core migracije se primenjuju jednom (LocalDB sam kreira fajlove `.mdf`/`.ldf`):

```bash
cd backend/UsersService && dotnet ef database update
cd ../TripsService     && dotnet ef database update
```

Demo nalozi se ubacuju automatski pri prvom pokretanju UsersService-a (BCrypt hashovani):

| Email              | Lozinka       | Uloga    |
|--------------------|---------------|----------|
| `lana@email.com`   | `password123` | admin    |
| `marko@email.com`  | `password123` | korisnik |

Demo plan (Japan, Prag, Lisabon) se ubacuje automatski pri prvom pokretanju TripsService-a.

### 2. Lokalni razvojni mod (bez Service Fabric-a)

Otvori četiri terminala i pokreni servise. Detektuju da nema `Fabric_ApplicationName` env vara i dižu se kao plain Kestrel.

```bash
# T1
cd backend/Gateway      && dotnet run    # http://localhost:8080
# T2
cd backend/UsersService && dotnet run    # http://localhost:8081
# T3
cd backend/TripsService && dotnet run    # http://localhost:8082
# T4
cd backend/ShareService && dotnet run    # http://localhost:8083 (in-memory dict)
```

Pa frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                              # http://localhost:5173
```

Health check: `curl http://localhost:8080/health` → `{"service":"gateway","status":"ok"}`.

### 3. Service Fabric deployment (sa instaliranim SDK-om)

```
1. Otvori backend/Putopis.sln u Visual Studio 2022
2. Set as Startup Project: PutopisCluster (Putopis.Application.sfproj)
3. Pre prvog deploy-a:
     - Start menu → "Service Fabric Local Cluster Manager" → Setup Local Cluster (5 Node)
     - Sačekaj zelene tačke (cluster up)
4. F5 → SF runtime startuje sve servise
   - Detekcija Fabric_ApplicationName env vara prebacuje Program.cs u SF mod
   - Stateful ShareService koristi Reliable Dictionary umesto in-memory dict-a
5. Aplikacija dostupna na http://localhost:19080 (SFX) i http://localhost:8080 (Gateway)
```

`backend/PutopisCluster/ApplicationParameters/Local.5Node.xml` koristi 3 replike za stateful servis. Za 1-Node cluster koristiti `Local.1Node.xml` (replikset = 1).

**Važno — LocalDB i Service Fabric:** SF pokreće servise pod sistemskim nalogom koji ne može da koristi per-user `(localdb)\MSSQLLocalDB` instancu. Zato je instanca deljena pod imenom `PutopisShared` (connection stringovi koriste `(localdb)\.\PutopisShared`). Jednokratni setup (admin PowerShell za `share`, ostalo obično):

```powershell
sqllocaldb share MSSQLLocalDB PutopisShared     # zahteva admin
sqllocaldb start MSSQLLocalDB
# zatim u instanci dodati logine za SF naloge (SSMS/sqlcmd kao vlasnik):
#   CREATE LOGIN [NT AUTHORITY\SYSTEM] FROM WINDOWS;
#   CREATE LOGIN [NT AUTHORITY\NETWORK SERVICE] FROM WINDOWS;
#   ALTER SERVER ROLE sysadmin ADD MEMBER [NT AUTHORITY\SYSTEM];
#   ALTER SERVER ROLE sysadmin ADD MEMBER [NT AUTHORITY\NETWORK SERVICE];
```

Posle restarta računara, ako Users/Trips servisi ne mogu da se podignu, pokrenuti `sqllocaldb start MSSQLLocalDB` (deljenu instancu može auto-startovati samo vlasnik).

### 3b. Service Fabric deployment iz komandne linije (bez VS GUI-a)

```powershell
# 1. Kreiraj lokalni dev cluster (jednom, admin PowerShell):
& "$env:ProgramFiles\Microsoft SDKs\Service Fabric\ClusterSetup\DevClusterSetup.ps1" -CreateOneNodeCluster

# 2. Package (VS 2022 MSBuild — VS 18 nema SF Tools komponentu):
& "C:\Program Files\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe" `
    backend\PutopisCluster\Putopis.Application.sfproj `
    /t:Package /p:Configuration=Release /p:VisualStudioVersion=17.0

# 3. Deploy:
Import-Module ServiceFabric
Connect-ServiceFabricCluster localhost:19000
Copy-ServiceFabricApplicationPackage -ApplicationPackagePath backend\PutopisCluster\pkg\Release `
    -ImageStoreConnectionString "file:C:\SfDevCluster\Data\ImageStoreShare" -ApplicationPackagePathInImageStore PutopisType
Register-ServiceFabricApplicationType -ApplicationPathInImageStore PutopisType
New-ServiceFabricApplication -ApplicationName fabric:/Putopis -ApplicationTypeName PutopisType -ApplicationTypeVersion 1.0.0 `
    -ApplicationParameter @{ Gateway_InstanceCount='1'; Users_InstanceCount='1'; Trips_InstanceCount='1'; Share_PartitionCount='1'; Share_TargetReplicaSetSize='1'; Share_MinReplicaSetSize='1' }
```

Service Fabric Explorer: http://localhost:19080. Redeploy = `Remove-ServiceFabricApplication` + `Unregister-ServiceFabricApplicationType` pa koraci 2–3 ponovo.

---

## Frontend env

`.env`:
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SHARE_BASE_URL=http://localhost:5173/share
VITE_USERS_HEALTH_URL=http://localhost:8081/health
VITE_TRIPS_HEALTH_URL=http://localhost:8082/health
VITE_SHARE_HEALTH_URL=http://localhost:8083/health
```

Aplikacija sve URL-ove čita iz env-a — promena gateway porta zahteva samo izmenu `.env` + restart Vite dev servera (`npm run dev`).

---

## Provera funkcionalnosti

- **Auth**: prijava sa demo nalogom → JWT u localStorage (key `putopis.token`), `Authorization: Bearer <token>` na svim daljim zahtevima.
- **Planovi**: dashboard, kreiranje/izmena/brisanje, kartice sa procentom budžeta i statusom.
- **Detalji plana**: 6 tabova — Pregled, Destinacije, Dani (lista + kalendar), Troškovi (graf po kategorijama), Checklist (po kategorijama), Beleške. Svako menjanje pokreće toast.
- **Deljenje**: dugme "Podeli" → modal sa pravim QR kodom (qrcode.react). Token se izdaje preko `POST /api/trips/{id}/share`. Otvaranje URL-a u inkognito tabu → anonimni `/share/:token` view koji koristi `X-Share-Token` header za sve dalje pozive (TripsService ima poseban `ShareTokenAuthHandler` koji to prepoznaje).
- **PDF**: dugme "PDF" otvara on-screen pregled, "Preuzmi" generiše stvaran PDF kroz jsPDF.
- **Admin**: prijava kao Lana → tab "Admin" → 3 unutrašnja taba:
  - Korisnici (search + filter, suspenduj/aktiviraj, brisanje sa potvrdom)
  - Svi planovi (read-only tabela kroz `GET /api/admin/trips`, vlasnici se spajaju klijentski)
  - Sistem & servisi (probovi `/health` svaki 15s)
- **Validacije**: kreiranje plana sa `kraj < pocetak` ili negativnim budžetom → 400 sa porukom.

---

## Spec checklist (FTN)

### Frontend
- [x] React aplikacija (Vite + TS)
- [x] Frontend ima sopstvene modele (`frontend/src/models/`)
- [x] HTTP pozivi su u servisima koji se injektuju u komponente — nikad direktno (`useService('trips')`, `useService('auth')`, itd.)
- [x] URL-ovi backend servisa su u `.env` fajlu (`VITE_API_BASE_URL`, `VITE_SHARE_BASE_URL`)
- [x] State management (Context API + custom hooks)
- [x] Validacije forme (real-time error poruke)
- [x] Error handling (toast, error overlays, error boundaries u SharedView)

### Backend
- [x] Microsoft Service Fabric platforma (StatelessService + StatefulService)
- [x] Najmanje 3 logički odvojena servisa (imamo 4: Gateway, Users, Trips, Share)
- [x] Stateless servisi (Gateway, Users, Trips)
- [x] Stateful servis sa Reliable Collections (Share — `IReliableDictionary<string, ShareTokenState>`)
- [x] MS SQL Server perzistencija (LocalDB + EF Core)
- [x] EF Core migracije (`InitialCreate` u Users i Trips servisima)
- [x] DTO i modeli baze su odvojeni (`backend/Common/Dto/` + `backend/<Service>/Data/Entities/`), mapiranje ručno u kontrolerima
- [x] BCrypt hash lozinke (`PasswordHasher.Hash` koristi `BCrypt.Net.BCrypt.HashPassword(..., workFactor: 11)`)
- [x] JWT — potpis i istek validirani (Gateway middleware preko `AddPutopisJwt`)
- [x] REST konvencije (resource-oriented URL-ovi, ispravni status kodovi)
- [x] Validacije: `Trip.Kraj >= Trip.Pocetak`, `Trip.Budzet >= 0`, `Activity.Datum ∈ [Pocetak, Kraj]`, `Expense.Iznos >= 0` (FluentValidation)
- [x] Kaskadno brisanje (EF Core `OnDelete(DeleteBehavior.Cascade)` na svim FK-ovima u TripsDbContext)

### Deljenje
- [x] Generisanje share linka sa QR kodom
- [x] VIEW i EDIT nivoi pristupa (provera u kontrolerima preko `IsShareReadOnly()`)
- [x] Anoniman pristup deljenom planu

### Deliverables
- [x] Source code u git repou
- [x] [README.md](README.md) sa setup uputstvima
- [x] [docs/architecture.md](docs/architecture.md) (Mermaid dijagram)
- [x] [docs/usecase.md](docs/usecase.md) (Mermaid use case dijagram)
- [x] [docs/api.md](docs/api.md) (REST API referenca)

---

## Recovery: LocalDB instanca pukla

Ako LocalDB izgubi registracije baza nakon restarta (Windows update, sleep), `.mdf` fajlovi su i dalje na disku — samo nisu attachovani:

```bash
sqllocaldb stop MSSQLLocalDB
sqllocaldb delete MSSQLLocalDB
sqllocaldb create MSSQLLocalDB
sqllocaldb start MSSQLLocalDB
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "CREATE DATABASE [Putopis_Users] ON (FILENAME = 'C:\Users\<vi>\Putopis_Users.mdf'), (FILENAME = 'C:\Users\<vi>\Putopis_Users_log.ldf') FOR ATTACH;"
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "CREATE DATABASE [Putopis_Trips] ON (FILENAME = 'C:\Users\<vi>\Putopis_Trips.mdf'), (FILENAME = 'C:\Users\<vi>\Putopis_Trips_log.ldf') FOR ATTACH;"
```

Postoje varijante koje brišu `.mdf` i puste EF da kreira ispočetka — to gubi podatke (uključujući korisnike) ali je validno za demo.

---

## Demo akcije za prezentaciju

1. **Login flow**: prijava kao Marko → dashboard prazne kartice (samo Lana ima seedovan Japan plan). Kreiraj novi plan → vidi se na dashboard-u.
2. **Detalji plana**: otvori Japan trip kao Lana → svih 6 tabova radi, dodaj destinaciju → vidi novi event row + counter na tabu.
3. **Validacija**: kreiraj plan sa krajem pre početka → toast sa greškom, plan se NE kreira.
4. **Deljenje (VIEW)**: Podeli → Samo pregled → kopiraj link → otvori u inkognito → anonimni `/share/<token>` view → pokušaj edit → 403 sa toast-om.
5. **Deljenje (EDIT)**: prebaci na Uređivanje u modalu → otvori novi link → mutacije rade, vidi se na izvornom nalogu posle refresh-a.
6. **Cascade delete**: u SSMS, pre brisanja: `SELECT COUNT(*) FROM Putopis_Trips.dbo.Activities;`. Obriši Japan plan iz UI-ja → ponovi count → svi children su obrisani.
7. **Admin**: prijava kao Lana → Admin tab → suspenduj Marka → odjavi se → pokušaj prijave kao Marko → 401. Lana ga aktivira → može ponovo.
8. **Health monitoring**: Admin → Sistem & servisi → 4 kartice sa real-time probovima `/health`.

---

## Tech stack

**Frontend:** React 18, TypeScript, Vite 8, axios, qrcode.react, jsPDF, Instrument Serif + Inter + JetBrains Mono fonts.

**Backend:** .NET 8, ASP.NET Core 8, Entity Framework Core 8, FluentValidation 12, BCrypt.Net-Next, JWT (`System.IdentityModel.Tokens.Jwt`), YARP 2 (reverse proxy), Microsoft.ServiceFabric.AspNetCore.Kestrel + Microsoft.ServiceFabric.Data 7 (Reliable Dictionary), Swagger.

**Storage:** SQL Server LocalDB (Putopis_Users + Putopis_Trips DB-ovi sa EF Core code-first migracijama) + Service Fabric Reliable Dictionary za share tokene.
