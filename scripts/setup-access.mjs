/**
 * npm run gohead:access [-- --user <username> --email <email>]
 *
 * Creates (or updates) the `studio-staff` role: full access to the studio's
 * content types and the media library, nothing else (no users, no settings,
 * no agents). Give it to whoever runs sessions with you.
 *
 * With --user, also creates a GoHead user of that role and prints its
 * password once. Admins can always sign in to the app as well.
 */
import { adminSession, log, randomSecret, writeEnv } from "./lib.mjs";

const TYPES = ["rooms", "locations", "devices", "cables", "maintenance", "clients", "bookings"];
/** Reads the bookings and what they point at, nothing else: for the calendar feed. */
const FEED_ROLE = {
  name: "calendar-feed",
  description: "Read-only: the bookings behind the .ics calendar feed",
  permissions: { content: { bookings: ["read"], rooms: ["read"], clients: ["read"], devices: ["read"] }, media: [] },
};

const ROLE = {
  name: "studio-staff",
  description: "Runs the studio: gear, cables, bookings and clients",
  permissions: {
    content: Object.fromEntries(TYPES.map((t) => [t, ["read", "create", "update", "delete"]])),
    media: ["read", "create", "update", "delete"],
  },
};

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const { url, api } = await adminSession();
console.log(`Setting up access on ${url}:`);

if (await api.find(`/admin/roles/${ROLE.name}`)) {
  await api("PUT", `/admin/roles/${ROLE.name}`, { description: ROLE.description, permissions: ROLE.permissions });
  log(`update role ${ROLE.name}`);
} else {
  await api("POST", "/admin/roles", ROLE);
  log(`create role ${ROLE.name}`);
}

// ---- The calendar feed: a read-only role, its token and the URL's secret ----
if (await api.find(`/admin/roles/${FEED_ROLE.name}`)) {
  await api("PUT", `/admin/roles/${FEED_ROLE.name}`, { description: FEED_ROLE.description, permissions: FEED_ROLE.permissions });
  log(`update role ${FEED_ROLE.name}`);
} else {
  await api("POST", "/admin/roles", FEED_ROLE);
  log(`create role ${FEED_ROLE.name}`);
}

if (env.GOHEAD_FEED_TOKEN) {
  log("keep GOHEAD_FEED_TOKEN (already set)");
} else {
  const res = await api("POST", "/admin/tokens", {
    name: "calendar-feed",
    role: FEED_ROLE.name,
    description: "Reads the bookings for the .ics calendar feed",
  });
  writeEnv("GOHEAD_FEED_TOKEN", res.data.token);
  log("create token calendar-feed → GOHEAD_FEED_TOKEN in .env.local");
}
if (env.STUDIO_ICS_SECRET) {
  log("keep STUDIO_ICS_SECRET (already set)");
} else {
  const secret = randomSecret(16);
  writeEnv("STUDIO_ICS_SECRET", secret);
  log(`create STUDIO_ICS_SECRET in .env.local → subscribe to /bookings.ics?key=${secret}`);
}

const username = flag("user");
if (username) {
  const users = (await api("GET", "/admin/users")).data?.users ?? [];
  if (users.some((u) => u.username === username)) {
    log(`keep user ${username} (already exists)`);
  } else {
    const password = randomSecret(9);
    await api("POST", "/admin/users", {
      username,
      email: flag("email") ?? `${username}@studio.local`,
      password,
      role_name: ROLE.name,
    });
    log(`create user ${username} (role ${ROLE.name}), password: ${password}`);
  }
}

console.log("Done. Sign in to the app with a GoHead admin, or a user of the studio-staff role.");
