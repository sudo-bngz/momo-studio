# Studio manager

A private back-office for an electronic music studio, built on [GoHead](https://github.com/gohead-cms/gohead):

- **Gear**: every synth, expander, drum machine, interface, patchbay and monitor, with its code, location, rack position, serial, purchase price, value, warranty, photo and maintenance log.
- **Ports**: each device lists its sockets (name, in/out, signal, connector). Cables plug into ports by name.
- **Cables**: every cable has a label code (`C-001`) and joins two ports. The app refuses a cable into a port that is already taken, refuses renaming a port that still has a cable, and flags anything odd: wrong signal, two outputs joined, unknown ports.
- **Studio map**: a floor plan of the rooms, with every rack, desk, stand and pedalboard where it really is, and the cable runs between them bundled by signal (hover a bundle for its cables). Click a place to zoom in: a rack opens as a front view, unit by unit; a desk or stand shows its machines, the cables between them, and where the others go. Edit the layout by dragging, resizing and turning places, moving them between rooms, and placing machines on a desk.
- **Consoles**: a mixing desk drawn as its channel strips. Each strip shows what's plugged into its mic, line, tape and insert sockets, its name, its routing (direct out, group pair, mix, aux sends up) and which socket its signal leaves by; the master section lists groups, auxes, mix, FX returns, 2-track, monitors with what each is wired to. Edit one channel or paste a row from a sheet, and print a scribble strip for the faders. An aux send that comes back into a channel sending to that aux (through pedals and patchbays) is flagged.
- **Templates**: a device's sockets in one click: Allen & Heath GS3 24/8/2 and 16/8/2, a generic console, interface or patchbay sized by a few numbers, a synth, a pedal. In *Add gear → Ports → Start from a template*; templates live in `src/lib/templates/devices.json`, add your own gear there.
- **Patchbays**: each patchbay drawn like the hardware, two rows of jacks numbered like the front panel (1–24 on top, 25–48 below), the label of every point, its mode (Normal, Half-normal, Thru), its DAW track and a group color. A point is named by the cable plugged in its rear (“Big Muff · Out”), or by a typed label for gear you haven't added. Edit one column, or every column as a table, and paste rows straight from Google Sheets or Excel. Print the designation strips at your jacks' real spacing.
- **Loop guard**: a pedal whose output comes back to its input, through a normalled column or a chain of effects, is flagged in red with the column to switch to Thru.
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

1. **Racks & places → Rooms & locations**: your rooms, then your racks (with their height in U), desks, shelves, cases. Then **Studio map → Edit layout**: set each room's size, and drag every place where it stands.
2. **Gear → Add gear**: each device with its ports. The port editor has presets (stereo out, MIDI in/out/thru…) and numbered batches (“Line In × 8”).
3. **Patchbays**: open each one, set its columns, paste your sheet's rows (labels, modes, Ableton tracks) under *All columns · paste from a sheet*, then **Add the rear ports**.
4. **Cables → Add cable**, *patch it* next to a free port on a device's page, or *Patch the rear* on a patchbay column. Write the code on both ends, or print the labels.

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
| `npm run gohead:seed` | Sample studio from `gohead/seed.json`: 2 rooms, 8 places, 24 devices (a GS3 24/8/2, 3 patchbays, pedals), 80 cables, bookings |
| `npm run gohead:setup` | `push`, `types` and `access` |

The setup scripts sign in with `GOHEAD_USERNAME` / `GOHEAD_PASSWORD` from `.env.local`.

## Content model

| GoHead collection | What it holds |
|-------------------|---------------|
| `rooms` | Bookable rooms, with rates, a calendar color, and their size and place on the studio map |
| `locations` | Racks (with their height in U), desks, shelves, cases, storage; each in a room, with its footprint, position and rotation on the map (cm) |
| `devices` | The gear. `ports` is a repeatable `port` component: name, direction, signal, connector, balanced, note. Patchbays also have `patch_columns` and `patch_points` (a repeatable `patch_point`: column, top and bottom labels, mode, DAW track, color, note). Consoles have `console_channels` and `channel_strips` (a repeatable `channel_strip`: number, label, source, route, direct, aux, color, note) |
| `cables` | Label code, signal, state (connected / spare / broken), `from_device` + `from_port`, `to_device` + `to_port`, plugs, length, color |
| `maintenance` | Repairs, services and calibrations of a device |
| `clients` | Artists and people who book |
| `bookings` | Title, client, room, start and end, state, type, engineer, reserved devices, price, paid |

A patchbay's rear points are its ports `Top 1`…`Top N` and `Bottom 1`…`Bottom N` (the patchbay page adds them for you). Through a Normal or Half-normal column, the signal goes from whichever rear cable comes from an output to the other one; that's what the plan, the arrows (N↓) and the loop guard follow. Cords patched in the front aren't recorded.

A console is any mixer whose ports are named `Ch N Mic`, `Ch N Line`, `Ch N Tape In`, `Ch N Insert`, `Ch N Track Out` (or `Direct Out`), plus `Group N Insert`/`Out`, `Aux N Out`, `Mix Insert L`/`Out L`, `FX Return N L`… The templates name them so. A strip's `route` is free text the app reads numbers from ("1-2 + mix"): the groups it feeds; `direct` sends it to its own track out; on in-line desks without group out jacks, a group comes out of the track outs of channels g, g+groups, g+2·groups. An insert is one TRS jack: model an insert cable as two cables into the same `Ch N Insert` port (tick *Allow a shared port*).

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
  app/(studio)/                pages: overview, gear, racks, places, cables, patchbays, plan, bookings, clients
  app/actions.ts               every write (Server Actions)
  app/login/                   sign-in
  app/media/                   private proxy for uploaded photos
  components/                  forms, port editor, patch plan diagram
  lib/data.ts                  every read
  lib/patch.ts                 the cable graph: port usage, issues, signal through normals, loops, plan layout
  lib/patchbay.ts              a patchbay as columns, labels from rear cables, pasting from a sheet
  lib/console.ts               a console as strips, routing, following a signal through the desk, aux loops
  lib/templates.ts, templates/ device templates (GS3, generic console / interface / patchbay)
  lib/studio-map.ts            the floor plan: default layout, cable bundles between places, zoom cards
  lib/session.ts               sign-in and the per-user GoHead client
  lib/time.ts                  studio time zone
  proxy.ts                     redirects visitors without a session to /login
```
