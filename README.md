# Studio manager

A private back-office for an electronic music studio, built on [GoHead](https://github.com/gohead-cms/gohead):

- **Gear**: every synth, expander, drum machine, interface, patchbay and monitor, with its code, location, rack position, serial, purchase price, value, warranty, photo and maintenance log.
- **Ports**: each device lists its sockets (name, in/out, signal, connector). Cables plug into ports by name.
- **Cables**: every cable has a label code (`C-001`) and joins two ports. The app refuses a cable into a port that is already taken, refuses renaming a port that still has a cable, and flags anything odd: wrong signal, two outputs joined, unknown ports.
- **Patch plan**: the whole studio as a signal-flow diagram (sources on the left, what they feed on the right), filterable by signal, focusable on one device, downloadable as SVG.
- **Cable labels**: two printable wrap-around labels per cable, one per end, each saying where both ends go.
- **Racks & places**: rack elevations (U by U) and what sits on each desk, shelf or case.
- **Bookings**: a week calendar per room, with clients, price and paid status, and the gear a session needs. Overlapping sessions in the same room, or the same machine reserved twice, are refused unless you say otherwise.

Stack: Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS 4, `@gohead-cms/client`. No database of its own: everything lives in GoHead.

## Quick start

You need Node.js 20.9+ and Docker.

```bash
cp .env.example .env.local
npm install
docker compose up -d        # GoHead (API + admin) on http://localhost:8080
npm run gohead:setup        # content model, TypeScript types, the studio-staff role
npm run gohead:seed         # optional: a sample studio to try things on
npm run dev                 # http://localhost:3000
```

Sign in with a GoHead account: `admin` / `gohead-local-password` locally (the defaults of `docker-compose.yml`, change them before exposing anything).

Starting with your own studio rather than the sample: skip `gohead:seed`, then in this order

1. **Racks & places → Rooms & locations**: your rooms, then your racks (with their height in U), desks, shelves, cases.
2. **Gear → Add gear**: each device with its ports. The port editor has presets (stereo out, MIDI in/out/thru…) and numbered batches (“Line In × 8”).
3. **Cables → Add cable**, or *patch it* next to a free port on a device's page. Write the code on both ends, or print the labels.

## Who can sign in

People sign in with their GoHead user; the app keeps GoHead's token in an httpOnly cookie and acts as that user, so GoHead's roles apply.

- Admins can do everything.
- `npm run gohead:access` creates the `studio-staff` role: full access to the studio's content and media, nothing else. Add `-- --user alex` to create a user of that role (the password is printed once). You can also create users in the GoHead admin.

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint`, `npm run typecheck` | ESLint; route types and `tsc` |
| `npm run gohead:push` | Applies `gohead/model.json` (never deletes types; `-- --dry-run` to preview) |
| `npm run gohead:types` | Regenerates `src/gohead.d.ts` from the model |
| `npm run gohead:access` | The `studio-staff` role (and a user with `-- --user <name>`) |
| `npm run gohead:seed` | Sample studio from `gohead/seed.json`: 2 rooms, 6 places, 18 devices, 40 cables, bookings |
| `npm run gohead:setup` | `push`, `types` and `access` |

The setup scripts sign in with `GOHEAD_USERNAME` / `GOHEAD_PASSWORD` from `.env.local`.

## Content model

| GoHead collection | What it holds |
|-------------------|---------------|
| `rooms` | Bookable rooms, with rates and a calendar color |
| `locations` | Racks (with their height in U), desks, shelves, cases, storage; each in a room |
| `devices` | The gear. `ports` is a repeatable `port` component: name, direction, signal, connector, balanced, note |
| `cables` | Label code, signal, state (connected / spare / broken), `from_device` + `from_port`, `to_device` + `to_port`, plugs, length, color |
| `maintenance` | Repairs, services and calibrations of a device |
| `clients` | Artists and people who book |
| `bookings` | Title, client, room, start and end, state, type, engineer, reserved devices, price, paid |

A cable points at a device by relation and at its port by name, because GoHead relations can't target a component. That's why renaming a port with a cable in it is refused: the cable would lose its end.

GoHead can't filter on relations, so pages read cables and maintenance whole and join them in the app (`src/lib/data.ts`). That's instant for a studio's few hundred entries.

To change the model: edit `gohead/model.json`, then `npm run gohead:push && npm run gohead:types && npm run typecheck`. Enum labels and colors are in `src/lib/vocab.ts`; the typecheck tells you which ones are missing.

## Environment

| Variable | |
|----------|--|
| `GOHEAD_URL` | GoHead as the app's server reaches it (default `http://localhost:8080`) |
| `STUDIO_TIMEZONE` | Bookings are typed and shown in this zone (default `Europe/Paris`) |
| `STUDIO_CURRENCY` | Currency of prices and values (default `EUR`) |
| `GOHEAD_USERNAME`, `GOHEAD_PASSWORD` | Setup scripts only: don't set them where the app is deployed |

## Deploying

GoHead's `standalone` mode (one process, SQLite, about 45 MB of memory) and this app both fit on a Raspberry Pi or a small VPS:

1. Run GoHead as in `docker-compose.yml`, with your own admin password, and back up its `/data` volume: it is your inventory.
2. `npm run build && npm start` with `GOHEAD_URL` pointing at it (or containerize the app). Photos are streamed through the app's `/media` route, so GoHead itself doesn't have to be public.
3. Put both behind HTTPS (the session cookie is `secure` in production).

## Project structure

```
gohead/model.json, seed.json   content model and sample studio
scripts/                       role and user setup
src/
  app/(studio)/                pages: overview, gear, racks, places, cables, plan, bookings, clients
  app/actions.ts               every write (Server Actions)
  app/login/                   sign-in
  app/media/                   private proxy for uploaded photos
  components/                  forms, port editor, patch plan diagram
  lib/data.ts                  every read
  lib/patch.ts                 the cable graph: port usage, issues, plan layout
  lib/session.ts               sign-in and the per-user GoHead client
  lib/time.ts                  studio time zone
  proxy.ts                     redirects visitors without a session to /login
```
