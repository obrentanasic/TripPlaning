# Putopis — Arhitektura

## Pregled servisa

```mermaid
graph TB
    User[👤 Korisnik / Gost<br/>Browser]
    React["⚛️ React SPA (Vite)<br/>http://localhost:5173"]

    User -->|HTTPS| React

    subgraph Cluster["Service Fabric Cluster (port 8080 javno)"]
        Gateway["🚪 Gateway<br/>Stateless · YARP<br/>JWT validacija + CORS"]
        Users["👥 UsersService<br/>Stateless · ASP.NET Core<br/>BCrypt + JWT issuance"]
        Trips["🧳 TripsService<br/>Stateless · ASP.NET Core<br/>Dual auth (JWT + Share)"]
        Share["🔗 ShareService<br/>Stateful · Reliable Dict<br/>Share tokens, 7-day TTL"]
    end

    subgraph DB["MS SQL Server (LocalDB)"]
        UsersDB[(Putopis_Users<br/>Users)]
        TripsDB[(Putopis_Trips<br/>Trips, Destinations,<br/>Activities, Expenses,<br/>ChecklistItems)]
    end

    React -->|"/api/**"| Gateway
    Gateway -->|"/api/auth, /api/users"| Users
    Gateway -->|"/api/trips, /api/admin/trips"| Trips
    Gateway -->|"/api/share"| Share

    Users -->|EF Core| UsersDB
    Trips -->|EF Core, cascade FK| TripsDB

    Trips -. "X-Internal-Key (S2S)<br/>POST /share/internal/issue<br/>DELETE /share/internal/{token}" .-> Share
    Trips -. "GET /api/share/{token}<br/>(via X-Share-Token header)" .-> Share

    classDef stateless fill:#3F5B43,stroke:#2C4030,color:#FBF7F0
    classDef stateful fill:#B5563A,stroke:#8E3F26,color:#FBF7F0
    classDef db fill:#80766A,stroke:#4A4239,color:#FBF7F0
    classDef external fill:#C89B3C,stroke:#8E6D29,color:#1A1612

    class Gateway,Users,Trips stateless
    class Share stateful
    class UsersDB,TripsDB db
    class User,React external
```

## Tok zahteva

```mermaid
sequenceDiagram
    autonumber
    participant U as Browser
    participant G as Gateway:8080
    participant US as UsersService:8081
    participant TS as TripsService:8082
    participant SH as ShareService:8083

    U->>G: POST /api/auth/login
    G->>US: forward
    US->>US: BCrypt.Verify + check status
    US-->>U: { token (JWT), user }

    Note over U,G: Naredni zahtevi nose<br/>Authorization: Bearer <token>

    U->>G: GET /api/trips/{id}
    G->>G: Validate JWT signature + exp
    G->>TS: forward
    TS-->>U: trip JSON

    U->>G: POST /api/trips/{id}/share { accessLevel: edit }
    G->>TS: forward
    TS->>TS: verify ownership
    TS->>SH: POST /api/share/internal/issue<br/>(X-Internal-Key)
    SH-->>TS: { token, expiresAt }
    TS-->>U: { token, url, expiresAt }

    Note over U,SH: Gost otvara /share/{token}

    U->>G: GET /api/share/{token} (anon)
    G->>SH: forward
    SH-->>U: { tripId, accessLevel, expiresAt }

    U->>G: GET /api/trips/{tripId}<br/>(X-Share-Token: token)
    G->>TS: forward
    TS->>SH: resolve token<br/>(GET /api/share/{token})
    SH-->>TS: { tripId, accessLevel }
    TS-->>U: trip JSON
```

## Sloj autentifikacije

```mermaid
graph LR
    Req[HTTP Request] --> Gateway

    Gateway -->|"Authorization: Bearer<br/>JWT scheme"| Bearer{JWT validan?}
    Gateway -->|"X-Share-Token<br/>ShareToken scheme"| ShareScheme{Token aktivan?}

    Bearer -->|Da| ClaimsJ["ClaimsPrincipal<br/>sub=userId<br/>role=korisnik / admin"]
    Bearer -->|Ne| Unauth401[401 Unauthorized]

    ShareScheme -->|Da| ClaimsS["ClaimsPrincipal<br/>NameIdentifier=tripId<br/>role=share<br/>accessLevel=view / edit"]
    ShareScheme -->|Ne| Unauth401

    ClaimsJ --> Controller
    ClaimsS --> Controller

    Controller -->|JWT user| Owner{trip.UserId<br/>== user.sub?}
    Controller -->|Share user| TripGuard{tripId<br/>== claim.tripId?}
    Controller -->|Mutating + share| EditGuard{"accessLevel<br/>== edit?"}

    Owner -->|Ne| NotFound[404]
    TripGuard -->|Ne| NotFound
    EditGuard -->|Ne| Forbidden[403]
```

## Baza podataka

```mermaid
erDiagram
    Users ||--o{ Trips : "owns (logical, cross-DB)"
    Trips ||--o{ Destinations : "cascade"
    Trips ||--o{ Activities : "cascade"
    Trips ||--o{ Expenses : "cascade"
    Trips ||--o{ ChecklistItems : "cascade"

    Users {
        Guid Id PK
        string Ime
        string Email UK
        string LozinkaHash "BCrypt"
        string Uloga "korisnik|admin"
        string Status "aktivan|suspendovan"
        DateTime RegistrovanDana
    }
    Trips {
        Guid Id PK
        Guid UserId "→ Users.Id"
        string Naziv
        string Opis
        DateOnly Pocetak
        DateOnly Kraj
        decimal Budzet
        string Valuta
        string Kover
        string Boja
        string Napomene
    }
    Destinations {
        Guid Id PK
        Guid TripId FK
        string Naziv
        string Lokacija
        DateOnly Dolazak
        DateOnly Odlazak
        string Opis
        string Foto
    }
    Activities {
        Guid Id PK
        Guid TripId FK
        Guid DestinationId "nullable"
        string Naziv
        DateOnly Datum
        TimeOnly Vreme
        string Lokacija
        string Opis
        decimal Trosak
        string Status "planirano|rezervisano|završeno|otkazano"
    }
    Expenses {
        Guid Id PK
        Guid TripId FK
        string Naziv
        string Kategorija "prevoz|smestaj|hrana|ulaznice|kupovina|ostalo"
        decimal Iznos
        DateOnly Datum
        string Opis
    }
    ChecklistItems {
        Guid Id PK
        Guid TripId FK
        string Naziv
        string Kategorija "dokumenti|tehnika|garderoba|higijena|ostalo"
        bool Zavrseno
    }
```

ShareTokens **nisu** u SQL bazi — žive u `IReliableDictionary<string, ShareTokenState>` unutar StatefulService-a. U lokalnom razvojnom modu se koristi `ConcurrentDictionary` koji ne preživljava restart procesa.
