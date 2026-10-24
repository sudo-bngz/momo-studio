/**
 * npm run studio:bootstrap [-- --file gohead/inventory.json] [--dry-run] [--fill-ports]
 *
 * Creates the studio described by gohead/inventory.json: the rooms, the places
 * in them, and every machine with its sockets filled in from the template
 * library. Matching is by code, so adding a line to the file and running this
 * again creates only what is missing — it never edits or deletes what is
 * already there. Rename a machine, move it, repatch it, add ports by hand: a
 * later run leaves all of it alone.
 *
 * --fill-ports is the one exception, and it is opt-in. A machine created
 * before its template existed sits there with an empty port list; with the
 * flag, a machine whose port list is empty AND whose line names a known
 * template gets those ports. Anything with even one port is left alone, so
 * the flag cannot overwrite work. Without it, those machines are only listed.
 *
 * The sockets come from src/lib/templates.ts, the same expander the app's
 * "Fill the ports" button uses, so a template fix reaches both at once.
 */
import { readFileSync } from "node:fs";

import { adminSession, log } from "./lib.mjs";
import { expandTemplate, TEMPLATES } from "../src/lib/templates.ts";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const dryRun = args.includes("--dry-run");
const fillPorts = args.includes("--fill-ports");
const file = flag("file") ?? "gohead/inventory.json";

const plan = JSON.parse(readFileSync(file, "utf8"));

/**
 * Check the file against gohead/model.json before touching the CMS, so a
 * misspelt field or a bad enum value is a message about line 23 rather than a
 * 400 halfway through creating the studio.
 */
function check() {
  const model = JSON.parse(readFileSync("gohead/model.json", "utf8")).collections;
  const problems = [];
  const relations = { room: "rooms", location: "locations" };
  const look = (collection, items, label) => {
    const attrs = model[collection]?.attributes ?? {};
    for (const item of items ?? []) {
      const who = `${collection}: ${item[label] ?? "?"}`;
      for (const [k, v] of Object.entries(item)) {
        if (k.startsWith("$") || k === "template" || k === "check") continue;
        const attr = attrs[k];
        if (!attr) {
          const near = Object.keys(attrs).filter((a) => a.includes(k) || k.includes(a));
          problems.push(`${who}: no field "${k}"${near.length ? ` — did you mean ${near.map((n) => `"${n}"`).join(" or ")}?` : ""}`);
          continue;
        }
        // Relations are given here by name and looked up, so skip the type check.
        if (relations[k]) continue;
        if (attr.options && !attr.options.includes(v)) {
          problems.push(`${who}: "${k}" is "${v}", which is not one of ${attr.options.join(", ")}`);
        }
      }
      for (const [k, attr] of Object.entries(attrs)) {
        // A uid is filled in by the CMS from the name; everything else
        // required has to be here, or in the template.
        if (!attr.required || attr.type === "uid" || k in item) continue;
        if (item.template && (k === "category" || k === "state")) continue;
        if (k === "state") continue; // defaulted below
        problems.push(`${who}: "${k}" is required and missing`);
      }
    }
  };
  look("rooms", plan.rooms, "name");
  look("locations", plan.locations, "name");
  look("devices", plan.devices, "code");
  return problems;
}

const problems = check();
if (problems.length) {
  console.error(`${file} does not match gohead/model.json:\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error("\nNothing was created. Fix the file and run it again.");
  process.exit(1);
}

const { url, api } = await adminSession();
console.log(`${dryRun ? "Would set up" : "Setting up"} the studio on ${url} from ${file}:`);

/**
 * What is already there, by its natural key, so this can be run twice.
 *
 * Every page of it: the API caps a page at 100, and a half-read list would
 * make the second run create duplicates of everything past the first page.
 */
const existing = async (collection, key = "name") => {
  const found = new Map();
  for (let page = 1; page <= 50; page++) {
    const res = await api("GET", `/api/collections/${collection}?page=${page}&pageSize=100`);
    const items = res.data?.[collection] ?? res.data ?? [];
    for (const i of items) if (i?.[key]) found.set(String(i[key]).toLowerCase(), i);
    const count = res.meta?.pagination?.pageCount ?? 1;
    if (items.length === 0 || page >= count) break;
  }
  return found;
};

// ---- Rooms ----
const rooms = await existing("rooms");
for (const room of plan.rooms ?? []) {
  const found = rooms.get(room.name.toLowerCase());
  if (found) {
    log(`keep room ${room.name}`);
    continue;
  }
  if (dryRun) {
    log(`create room ${room.name}`);
    continue;
  }
  // The slug is a uid the CMS wants given, and nobody should have to write
  // one in the file: it comes from the name, same as the app's own form.
  const slugify = (s) =>
    s
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "room";
  const slug = room.slug ?? slugify(room.name);
  const res = await api("POST", "/api/collections/rooms", { data: { ...room, slug } });
  rooms.set(room.name.toLowerCase(), res.data);
  log(`create room ${room.name}`);
}

// ---- Places ----
const locations = await existing("locations");
for (const place of plan.locations ?? []) {
  if (locations.get(place.name.toLowerCase())) {
    log(`keep place ${place.name}`);
    continue;
  }
  // The file names the room; the CMS wants its id.
  const room = rooms.get(String(place.room ?? "").toLowerCase());
  const data = { ...place, room: room?.id };
  if (!room) delete data.room;
  if (dryRun) {
    log(`create place ${place.name}`);
    continue;
  }
  const res = await api("POST", "/api/collections/locations", { data });
  locations.set(place.name.toLowerCase(), res.data);
  log(`create place ${place.name}`);
}

// ---- Machines ----
const devices = await existing("devices", "code");
const known = new Set(TEMPLATES.map((t) => t.id));
let made = 0;
let skipped = 0;
const missing = [];
const toCheck = [];

const couldFill = [];
let filled = 0;

for (const item of plan.devices ?? []) {
  const there = devices.get(String(item.code).toLowerCase());
  if (there) {
    // The one case where something already there is worth touching: it has no
    // ports at all and its line names a template — which happens when the
    // machine was created before its template existed. Adding ports to an
    // empty list cannot overwrite anything, so it is offered, behind a flag.
    const empty = !there.ports?.length;
    if (empty && item.template && known.has(item.template)) {
      const ports = expandTemplate(item.template).ports;
      if (fillPorts && !dryRun) {
        // Send back what is there, minus what the CMS writes itself, with the
        // relation flattened to its id — a PUT replaces the whole entry.
        const WROTE_ITSELF = ["id", "createdAt", "updatedAt", "photo", "photos", "location"];
        const rest = Object.fromEntries(Object.entries(there).filter(([k]) => !WROTE_ITSELF.includes(k)));
        await api("PUT", `/api/collections/devices/${there.id}`, {
          data: { ...rest, ...(there.location?.id ? { location: there.location.id } : {}), ports },
        });
        log(`fill ${item.code} ${item.name} (${ports.length} ports)`);
        filled++;
        continue;
      }
      couldFill.push(`${item.code} ${item.name}: ${ports.length} ports from "${item.template}"`);
    }
    log(`keep ${item.code} ${item.name}`);
    skipped++;
    continue;
  }

  let ports = [];
  let category = item.category;
  let brand = item.brand;
  let model = item.model;
  // A patchbay needs its column count and a console its channel count, or the
  // board pages have nothing to draw.
  let shape = {};
  if (item.template) {
    if (!known.has(item.template)) {
      missing.push(`${item.code} ${item.name}: no template "${item.template}"`);
    } else {
      const expanded = expandTemplate(item.template);
      ports = expanded.ports;
      category ??= expanded.category;
      brand ??= expanded.brand;
      model ??= expanded.model;
      if (expanded.patch_columns) shape.patch_columns = expanded.patch_columns;
      if (expanded.console?.channels) shape.console_channels = expanded.console.channels;
    }
  }

  const place = locations.get(String(item.location ?? "").toLowerCase());
  const data = {
    name: item.name,
    code: item.code,
    category: category ?? "other",
    state: item.state ?? "in_use",
    ...(brand ? { brand } : {}),
    ...(model ? { model } : {}),
    ...(item.notes ? { notes: item.notes } : {}),
    ...(place ? { location: place.id } : {}),
    ...(ports.length ? { ports } : {}),
    ...shape,
  };

  if (item.check) toCheck.push(`${item.code}  ${item.name}`);
  if (dryRun) {
    log(`create ${item.code} ${item.name} (${ports.length} ports)`);
    made++;
    continue;
  }
  await api("POST", "/api/collections/devices", { data });
  log(`create ${item.code} ${item.name} (${ports.length} ports)`);
  made++;
}

const verb = dryRun ? "Would create" : "Created";
const fill = filled ? `, filled the ports of ${filled}` : "";
console.log(`\n${verb} ${made} machine(s)${fill}; ${skipped} already there.`);
if (missing.length) {
  console.log("\nTemplates not found — these were created without ports:");
  for (const m of missing) console.log(`  ${m}`);
}
if (couldFill.length) {
  console.log(`\nAlready there with no ports, and a template that would fill them:`);
  for (const c of couldFill) console.log(`  ${c}`);
  console.log("  Run again with --fill-ports to add them. It only ever touches a machine");
  console.log("  whose port list is empty, so nothing you have entered can be overwritten.");
}
if (toCheck.length) {
  console.log("\nWorth a look at the back panel before you trust the ports:");
  for (const c of toCheck) console.log(`  ${c}`);
}
console.log("\nNext: open the app, check the patchbay modes, then patch the cables.");
