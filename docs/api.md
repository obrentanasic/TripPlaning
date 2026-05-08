# Putopis — REST API

Sve rute idu kroz Gateway na `http://localhost:8080`. CORS je otvoren samo za frontend origin (`http://localhost:5173`).

## Konvencije

- `Authorization: Bearer <jwt>` — za sve endpointe osim auth + share resolve.
- `X-Share-Token: <token>` — alternativa JWT-u za pristup planu kroz deljeni token.
- 401 = nepostojeći ili nevalidan token; 403 = autentifikovan ali bez prava; 404 = resurs ne postoji ili nije vlasništvo korisnika.
- Datumi se šalju kao `yyyy-MM-dd`. Vreme kao `HH:mm`. Iznosi kao decimalni brojevi (npr. `120.50`).

## Autentifikacija

| Method | Path                       | Auth | Body                                | 200 vraća                         |
|--------|----------------------------|------|-------------------------------------|-----------------------------------|
| POST   | `/api/auth/register`       | —    | `{ ime, email, lozinka }`           | `{ token, expiresAt, user }`      |
| POST   | `/api/auth/login`          | —    | `{ email, lozinka }`                | `{ token, expiresAt, user }`      |

## Trenutni korisnik

| Method | Path                       | Auth          | Vraća                |
|--------|----------------------------|---------------|----------------------|
| GET    | `/api/users/me`            | JWT           | `UserDto`            |

## Admin (zahteva `role=admin`)

| Method | Path                            | Body                       | 200 vraća            |
|--------|---------------------------------|----------------------------|----------------------|
| GET    | `/api/users`                    | —                          | `UserDto[]`          |
| PATCH  | `/api/users/{id}/status`        | `{ status }`               | `UserDto`            |
| DELETE | `/api/users/{id}`               | —                          | 204                  |
| GET    | `/api/admin/trips`              | —                          | `AdminTripDto[]`     |

## Planovi

JWT scheme — vlasnik može sve. Share-token scheme — pristup samo za jedan tripId, edit operacije zahtevaju `accessLevel=edit`.

| Method | Path                          | Auth        | Body                           | 200 vraća   | Napomena                              |
|--------|-------------------------------|-------------|--------------------------------|-------------|---------------------------------------|
| GET    | `/api/trips`                  | JWT         | —                              | `Trip[]`    | Samo svoji planovi                    |
| POST   | `/api/trips`                  | JWT         | `CreateTripRequest`            | `Trip`      | Validacija: `kraj >= pocetak`, `budzet >= 0` |
| GET    | `/api/trips/{id}`             | JWT \| Share| —                              | `Trip`      | Share token vidi samo svoj tripId     |
| PUT    | `/api/trips/{id}`             | JWT         | `UpdateTripRequest`            | `Trip`      |                                        |
| DELETE | `/api/trips/{id}`             | JWT         | —                              | 204         | Kaskada na sve dete entitete          |

### Destinacije, aktivnosti, troškovi, checklist

Sve nested rute koriste isti šablon (`{resource}` ∈ `destinations | activities | expenses | checklist`):

| Method | Path                                                         | Body                                  |
|--------|--------------------------------------------------------------|---------------------------------------|
| GET    | `/api/trips/{tripId}/{resource}`                             | —                                     |
| POST   | `/api/trips/{tripId}/{resource}`                             | `{Resource}CreateRequest`             |
| PUT    | `/api/trips/{tripId}/{resource}/{id}`                        | `{Resource}UpdateRequest`             |
| DELETE | `/api/trips/{tripId}/{resource}/{id}`                        | —                                     |

Posebno za checklist:

| Method | Path                                                         | Body                                  |
|--------|--------------------------------------------------------------|---------------------------------------|
| PATCH  | `/api/trips/{tripId}/checklist/{id}`                         | `{ zavrseno: bool }`                  |

Brisanje destinacije briše i sve aktivnosti vezane za tu destinaciju.

## Deljenje (ShareService)

| Method | Path                                | Auth          | Body                  | Vraća                                    |
|--------|-------------------------------------|---------------|-----------------------|------------------------------------------|
| POST   | `/api/trips/{id}/share`             | JWT vlasnik   | `{ accessLevel }`     | `{ token, url, expiresAt, accessLevel }` |
| DELETE | `/api/trips/{id}/share`             | JWT vlasnik   | —                     | 204 (revokuje sve tokene za plan)        |
| GET    | `/api/share/{token}`                | —             | —                     | `{ tripId, accessLevel, expiresAt }`     |

Interni endpointi (gated by `X-Internal-Key`, koristi ih samo TripsService → ShareService):

| Method | Path                                       | Body                                                       |
|--------|--------------------------------------------|------------------------------------------------------------|
| POST   | `/api/share/internal/issue`                | `{ tripId, accessLevel, issuedByUserId, ttlDays? }`        |
| DELETE | `/api/share/internal/{token}`              | —                                                          |
| DELETE | `/api/share/internal/trip/{tripId}`        | —                                                          |

## Health

Svaki servis odgovara na `/health` (port direktan ili kroz Gateway):

```
GET http://localhost:8080/health → { service: "gateway", status: "ok" }
GET http://localhost:8081/health → { service: "users", status: "ok" }
GET http://localhost:8082/health → { service: "trips", status: "ok" }
GET http://localhost:8083/health → { service: "share", status: "ok", storage: "in-memory" | "service-fabric-reliable-dictionary" }
```
