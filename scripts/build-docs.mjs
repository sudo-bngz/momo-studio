/**
 * npm run docs
 *
 * Builds the GitHub Pages site in docs/ from the same help text the app uses
 * (src/lib/help.ts), so the manual on the web, the panels on each page and
 * /guide inside the app can't drift apart.
 *
 * Owns docs/index.html, docs/guide.html and docs/setup.html. Everything else
 * in docs/ is written by hand: style.css, and img/ (shot from the running app
 * by scratch/docshots.mjs).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { GLOSSARY, GUIDE_PARTS, TOPICS } from "../src/lib/help.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = resolve(ROOT, "docs");
const REPO = "https://github.com/sudo-bngz/momo-studio";

// ---- Text ----

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The same little markup the app renders: **bold**, *italic*, `code`. */
const rich = (s) =>
  esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*([^*\s][^*]*)\*/g, "<em>$1</em>");

// ---- Pictures ----

/** An SVG lifted out of the app, inlined so it scales and needs no stylesheet. */
const svg = (name) => {
  const path = resolve(DOCS, "img", `${name}.svg`);
  return existsSync(path) ? readFileSync(path, "utf8") : `<!-- missing ${name}.svg -->`;
};

const figure = (src, caption, { wide = false } = {}) =>
  existsSync(resolve(DOCS, "img", src))
    ? `<figure class="shot${wide ? " wide" : ""}">
      <a href="img/${src}" target="_blank" rel="noreferrer"><img src="img/${src}" alt="${esc(caption)}" loading="lazy" /></a>
      <figcaption>${esc(caption)}</figcaption>
    </figure>`
    : `<!-- missing ${src} -->`;

const drawing = (name, caption) => `<figure class="drawing">
      ${svg(name)}
      <figcaption>${esc(caption)}</figcaption>
    </figure>`;

/** What each chapter of the guide shows, after its first paragraph. */
const CHAPTER_ART = {
  overview: () => figure("overview.webp", "The overview: what's in the studio, how it's wired, who's coming."),
  assets: () => figure("assets.webp", "The gallery. A machine with no photo yet is drawn from its category and its size."),
  "asset-form": () => figure("assets-table.webp", "The same assets as a table, for scanning and sorting."),
  racks: () => figure("racks.webp", "Rack elevations, unit by unit, counted from U1 at the top."),
  map: () =>
    figure("map.webp", "The room from above, in real centimetres, with the cable runs bundled between places.") +
    figure("map-zoom.webp", "Click a place and it is drawn alone, large, with every cable entering and leaving it named."),
  cables: () => figure("cables.webp", "Every run, and everything the plan found wrong with the current patch."),
  patchbays: () => figure("normalling.webp", "What a column's three modes do. The app follows a signal through the first two as if the points were one wire, and stops at the third — because that is what the hardware does.", { wide: true }),
  patchbay: () => figure("patchbay.webp", "A bay drawn like the hardware: two rows of jacks, each column's label, its mode and where it goes."),
  consoles: () => figure("console.webp", "The GS3 as its 24 channel strips, with the master section underneath."),
  console: () =>
    drawing("channel-flow", "One channel of the GS3. The channel path carries mic or line through the insert, the EQ and the fader, and leaves by one of four routes. The monitor path carries the tape return on its own level — which is why every channel has a Tape In.") +
    drawing("inline-groups", "Why the desk has eight groups and no group output sockets: the group buses are paralleled onto the channels' track outs. Group 1 comes out of channel 1, 9 or 17; group 2 out of 2, 10 or 18.") +
    figure("console-channel.webp", "Channel 5 routed to groups 3-4. The app names the six track outs the group lands on, and says why there is more than one."),
  plan: () => figure("plan.webp", "The whole studio as one signal-flow diagram, sources on the left."),
  bookings: () => figure("bookings.webp", "The week, one column per day, tinted by room."),
  activity: () => figure("activity.webp", "Every change, by whom, with a way back to any earlier version."),
  people: () => figure("accounts.webp", "Who can sign in, and what they are allowed to do."),
};

// ---- Chapters ----

function chapter(id) {
  const t = TOPICS[id];
  const art = CHAPTER_ART[id]?.() ?? "";
  const points = t.points?.length
    ? `<dl class="points">${t.points.map((p) => `<dt>${esc(p.term)}</dt><dd>${rich(p.text)}</dd>`).join("")}</dl>`
    : "";
  const steps = t.steps?.length ? `<h4>Doing it</h4><ol>${t.steps.map((s) => `<li>${rich(s)}</li>`).join("")}</ol>` : "";
  const long = t.long?.map((p) => `<p>${rich(p)}</p>`).join("") ?? "";
  const see = t.see?.length
    ? `<p class="see">See also ${t.see.map((s) => `<a href="#${s}">${esc(TOPICS[s].title)}</a>`).join(" · ")}</p>`
    : "";
  return `<article id="${id}">
      <h3>${esc(t.title)}</h3>
      <p class="lede">${rich(t.lede)}</p>
      ${art}
      ${long}
      ${points}
      ${steps}
      ${see}
    </article>`;
}

// ---- The shell ----

const NAV = [
  ["index.html", "Home"],
  ["guide.html", "Guide"],
  ["setup.html", "Setup &amp; deploy"],
];

const page = (file, title, lede, body, { toc = "", wide = false } = {}) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} · Studio manager</title>
<meta name="description" content="${esc(lede)}" />
<link rel="stylesheet" href="style.css" />
<link rel="icon" href="img/favicon.svg" type="image/svg+xml" />
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <a class="brand" href="index.html"><img class="mark" src="img/favicon.svg" alt="" width="24" height="24" /> Studio manager</a>
  <nav>
    ${NAV.map(([href, label]) => `<a href="${href}"${href === file ? ' class="here" aria-current="page"' : ""}>${label}</a>`).join("\n    ")}
    <a href="${REPO}" class="out">GitHub</a>
  </nav>
</header>
<div class="shell${toc ? " with-toc" : ""}">
${toc}
<main id="main"${wide ? ' class="wide"' : ""}>
${body}
</main>
</div>
<footer>
  <p>A private back-office for an electronic music studio, built on <a href="https://github.com/gohead-cms/gohead">GoHead</a>.
  This manual is generated from <code>src/lib/help.ts</code> — the same text the app shows on each page.</p>
</footer>
</body>
</html>
`;

// ---- Home ----

const FEATURES = [
  {
    title: "Every machine, with its sockets",
    text: "Synths, expanders, interfaces, pedals, the desk, the patchbays, the computers — with the code you write on the box, where it lives, what it cost, and its ports. A machine you haven't photographed yet is drawn from its category and its size, so a rack still reads at a glance.",
    shot: ["assets.webp", "Assets, as a gallery. Photos are resized in the browser before upload."],
    href: "guide.html#assets",
  },
  {
    title: "The room, to scale",
    text: "A floor plan in real centimetres: every rack, desk, stand and pedalboard where it actually stands, and the cable runs between them bundled into the one thing you trip over. Click a place and it opens alone, large, with every cable entering and leaving it named.",
    shot: ["map-zoom.webp", "A rack, zoomed, with its stubs to everywhere else."],
    href: "guide.html#map",
  },
  {
    title: "The patchbays, as boards",
    text: "Two rows of jacks numbered like the front panel, the label of every point, and each column's mode — normal, half-normal or thru. Paste a row straight out of the old spreadsheet, and print the designation strips at your jacks' real spacing.",
    shot: ["patchbay.webp", "A bay drawn like the hardware."],
    href: "guide.html#patchbays",
  },
  {
    title: "The desk, channel by channel",
    text: "The Allen &amp; Heath GS3 as its 24 strips: what's in each mic, line, tape and insert socket, what the channel is called, where it's routed, and which socket its signal actually leaves by. An aux that comes back into a channel feeding the same aux is caught before it howls.",
    shot: ["console.webp", "The GS3, with the master section underneath."],
    href: "guide.html#console",
  },
  {
    title: "The signal, followed",
    text: "The whole studio as one diagram, ranked by how far a signal has travelled — sources on the left, monitors on the right. It follows a signal through normalled columns, through pedals, and through the desk's own routing, and stops where the hardware stops.",
    shot: ["plan.webp", "The patch plan. Red is a loop."],
    href: "guide.html#plan",
  },
  {
    title: "Sessions and clients",
    text: "A week per room with clients, price and paid status. Double bookings are caught, and the whole calendar is subscribable as a feed, so the week is on your phone without opening anything.",
    shot: ["bookings.webp", "The week, tinted by room."],
    href: "guide.html#bookings",
  },
  {
    title: "Who changed what",
    text: "Every create, change and delete is recorded as it happens, in the same transaction, so the trail can't drift from the data. Read it by person or by machine, compare any two versions field by field, and put one back. Deleted things come back under their own id.",
    shot: ["activity.webp", "The trail, filterable by person, type and kind of change."],
    href: "guide.html#activity",
  },
  {
    title: "Help where you are",
    text: "Every page carries a panel whose first sentence is always on screen and whose detail is one click away. The same text, at length and with drawings, is the guide — in the app and on this site.",
    shot: ["help-panel.webp", "The panel on the cables page, opened."],
    href: "guide.html#model",
  },
];

const home = page(
  "index.html",
  "Studio manager",
  "A private back-office for an electronic music studio: assets, cable management, the patchbays, the desk, and bookings.",
  `<section class="hero">
  <h1>Studio manager</h1>
  <p class="lede">Every machine, every cable and every session in one private back-office — with the patchbays and the
  desk modelled properly, so the app can tell you where a signal actually goes.</p>
  <p class="actions">
    <a class="btn primary" href="guide.html">Read the guide</a>
    <a class="btn" href="setup.html">Set it up</a>
    <a class="btn" href="${REPO}">Source</a>
  </p>
  ${figure("console.webp", "The Allen & Heath GS3 24/8/2 drawn as its channel strips.", { wide: true })}
</section>

<section>
  <h2>What it does</h2>
  <div class="features">
    ${FEATURES.map(
      (f) => `<section class="feature">
      <h3><a href="${f.href}">${f.title}</a></h3>
      <p>${f.text}</p>
      ${figure(f.shot[0], f.shot[1])}
    </section>`,
    ).join("\n    ")}
  </div>
</section>

<section id="quick-start">
  <h2>Quick start</h2>
  <p>Node.js 20.9+ and Docker. Five minutes, start to a studio you can click around.</p>
  <pre><code>git clone ${REPO}.git studio-manager
cd studio-manager
cp .env.example .env.local
npm install
docker compose up -d   # GoHead (API + admin) on :8080
npm run gohead:setup   # content model, types, the studio-staff role
npm run gohead:seed    # optional: a sample studio to click around
npm run dev            # http://localhost:3000</code></pre>
  <p>Run them one at a time — if <code>npm install</code> fails, everything after it fails too, for want of a
  <code>node_modules/</code>. Sign in with <code>admin</code> / <code>gohead-local-password</code>, the defaults in
  <code>docker-compose.yml</code>; change them before exposing anything. The sample studio holds a GS3 24/8/2, three
  patchbays, a Eurorack case, pedals and 80 cables, so every page has something in it from the first click.
  <a href="setup.html">The setup page</a> has the rest: your own studio, the environment, deploying, and what to do when
  <code>npm install</code> fails behind a corporate proxy.</p>
</section>

<section>
  <h2>On a phone, in the live room</h2>
  <div class="split">
    <p>Every page works at phone width, which is where you are when you're actually looking at the back of a rack.
    The cable labels and the patchbay and scribble strips print to paper at real spacing.</p>
    ${figure("mobile.webp", "The assets gallery at phone width.")}
  </div>
</section>`,
  { wide: true },
);

// ---- Guide ----

const guideToc = `<nav class="toc" aria-label="Contents">
  <h2>Contents</h2>
  <ol>
    ${GUIDE_PARTS.map(
      (part) => `<li><span class="part">${esc(part.title)}</span>
      <ul>${part.topics.map((t) => `<li><a href="#${t}">${esc(TOPICS[t].title)}</a></li>`).join("")}</ul>
    </li>`,
    ).join("\n    ")}
    <li><a href="#glossary" class="part-link">Glossary</a></li>
  </ol>
</nav>`;

const guide = page(
  "guide.html",
  "Guide",
  "How the app is put together, and how the studio it describes is put together — including why an in-line desk like the Allen & Heath GS3 behaves the way it does.",
  `<h1>Guide</h1>
<p class="lede">How the app is put together, and how the studio it describes is put together. This is the same text the app
shows on each page, at length and with the drawings. The <a href="#console">console chapter</a> is the one worth reading
properly: an in-line desk like the Allen &amp; Heath GS3 behaves in a way that looks like a bug until you know it isn't.</p>

${GUIDE_PARTS.map(
  (part, i) => `<section class="part">
  <h2><span class="num">${i + 1}</span> ${esc(part.title)}</h2>
  <p class="blurb">${esc(part.blurb)}</p>
  ${part.topics.map(chapter).join("\n  ")}
</section>`,
).join("\n")}

<section class="part" id="glossary">
  <h2><span class="num">${GUIDE_PARTS.length + 1}</span> Glossary</h2>
  <dl class="points">
    ${Object.values(GLOSSARY).map((g) => `<dt>${esc(g.term)}</dt><dd>${esc(g.text)}</dd>`).join("\n    ")}
  </dl>
</section>`,
  { toc: guideToc },
);

// ---- Setup ----

const setup = page(
  "setup.html",
  "Setup & deploy",
  "Installing, running against your own GoHead, the scripts, the environment, and deploying to Render.",
  `<h1>Setup &amp; deploy</h1>
<p class="lede">The app keeps no database of its own: everything lives in GoHead, and the app talks to it as you. So the
setup is really two things — a GoHead with the studio's content model pushed into it, and this app pointed at it.</p>

<h2 id="install">Install and run</h2>
<p>You need Node.js 20.9 or newer, and Docker to run GoHead locally.</p>
<pre><code>git clone ${REPO}.git studio-manager
cd studio-manager
cp .env.example .env.local
npm install
docker compose pull    # once, and whenever you move GoHead forward
docker compose up -d   # GoHead (API + admin) on :8080
npm run gohead:setup   # model + types + the studio-staff role and feed secrets
npm run gohead:seed    # optional: a sample studio
npm run dev</code></pre>
<p>Open <code>http://localhost:3000</code> and sign in with <code>admin</code> / <code>gohead-local-password</code> — the
defaults in <code>docker-compose.yml</code>. Change them before this is reachable from anywhere but your laptop.</p>

<h2 id="your-studio">Your own studio instead of the sample</h2>
<p>Skip <code>npm run gohead:seed</code> and start empty. The order that saves the most work:</p>
<ol>
  <li>Rooms and locations first — the racks, desks and stands you'll put things in.</li>
  <li>The machines. Fill the ports from a template where there is one; the Allen &amp; Heath GS3 24/8/2 fills 163 ports,
  correctly named. Templates live in <code>src/lib/templates/devices.json</code> — add your own gear there.</li>
  <li>The patchbays, with each column's mode set to match the hardware.</li>
  <li>The cables. If the patch already lives in a spreadsheet, paste it a column at a time into the patchbay and console
  boards rather than typing it again.</li>
</ol>

<h2 id="scripts">Scripts</h2>
<dl class="points">
  <dt><code>npm run dev</code></dt><dd>The app, in development, on :3000.</dd>
  <dt><code>npm run build</code> / <code>npm start</code></dt><dd>A production build, and serving it.</dd>
  <dt><code>docker compose up -d</code></dt><dd>GoHead itself, API and admin, on :8080, with its data in a named volume.</dd>
  <dt><code>npm run gohead:setup</code></dt><dd>The usual one: pushes the model, regenerates the TypeScript types, creates the
  roles and the calendar feed's secrets. Run it after every <code>git pull</code> that changed the model.</dd>
  <dt><code>npm run gohead:push</code></dt><dd>Just the model — <code>gohead/model.json</code>, the collections and components
  the app reads.</dd>
  <dt><code>npm run gohead:types</code></dt><dd>Regenerates <code>src/gohead.d.ts</code> from the model, so the app stops
  compiling when the two disagree.</dd>
  <dt><code>npm run gohead:seed</code></dt><dd>Loads <code>gohead/seed.json</code>: the sample studio.</dd>
  <dt><code>npm run gohead:access</code></dt><dd>Creates the <code>studio-staff</code> role, the read-only
  <code>calendar-feed</code> role, its token and the calendar URL's secret. With <code>-- --user alex</code> it also creates a
  person and prints their password once.</dd>
  <dt><code>npm run docs</code></dt><dd>Rebuilds this site from <code>src/lib/help.ts</code>.</dd>
  <dt><code>npm run lint</code> / <code>typecheck</code></dt><dd>What CI would run.</dd>
</dl>

<h2 id="environment">Environment</h2>
<dl class="points">
  <dt><code>GOHEAD_URL</code></dt><dd>Where GoHead is, as this server reaches it. Defaults to <code>http://localhost:8080</code>.</dd>
  <dt><code>GOHEAD_HOSTPORT</code></dt><dd>Set by the Render blueprint from the CMS service's private address; used when
  <code>GOHEAD_URL</code> is unset, so the two services talk over the private network.</dd>
  <dt><code>GOHEAD_FEED_TOKEN</code></dt><dd>A read-only API token for the calendar feed. Written by
  <code>npm run gohead:access</code>.</dd>
  <dt><code>STUDIO_ICS_SECRET</code></dt><dd>The <code>?key=</code> in the calendar URL. Also written by that script.</dd>
  <dt><code>STUDIO_TZ</code></dt><dd>The studio's time zone, for the calendar and the booking grid. Defaults to
  <code>Europe/Paris</code>.</dd>
</dl>
<p class="note">The app never holds a GoHead admin password. Each person signs in as themselves and the app keeps that
person's own GoHead token in an httpOnly cookie, which is what makes the activity trail say who did what.</p>

<h2 id="calendar">Subscribing to the calendar</h2>
<p>After <code>npm run gohead:access</code>, <code>.env.local</code> holds <code>STUDIO_ICS_SECRET</code>. Subscribe to:</p>
<pre><code>https://&lt;your-app&gt;/bookings.ics?key=&lt;STUDIO_ICS_SECRET&gt;</code></pre>
<p>It's read-only and one way: it shows your sessions in your calendar, it doesn't take events back. Google refreshes an
external calendar on its own schedule, often hours — fine for the week in your pocket, not for a change you just made.</p>

<h2 id="deploy">Deploying to Render</h2>
<p><code>render.yaml</code> in the repo is a blueprint for two services: GoHead with a disk for its data, and this app.
They talk over Render's private network, so no token ever leaves it.</p>
<ol>
  <li>Push the repo to your own GitHub account.</li>
  <li>In Render: <em>New → Blueprint</em>, pick the repo, apply.</li>
  <li>Set <code>GOHEAD_USERNAME</code> and <code>GOHEAD_PASSWORD</code> on the <strong>CMS</strong> service only — not on the
  app, so that a compromise of the app doesn't hand over admin.</li>
  <li>Once it's up, run <code>gohead:push</code> and <code>gohead:access</code> against it with
  <code>GOHEAD_URL</code> pointing at the CMS's URL.</li>
</ol>
<p class="note">The CMS service must be on a paid plan: Render's free services can send private-network requests but not
receive them, and the app needs to reach the CMS.</p>

<h2 id="restart-loop">When GoHead restarts every minute: <code>unknown command "standalone"</code></h2>
<pre><code>Error: unknown command "standalone" for "gohead"
2026/10/22 20:12:34 Error executing command: unknown command "standalone" for "gohead"</code></pre>
<p>The image is older than GoHead v0.6.0, which is where <code>standalone</code> landed.
<code>docker compose up -d</code> reuses a tag it has already pulled without asking the registry, so an image
fetched before then keeps starting the old binary — and <code>restart: unless-stopped</code> turns that into a loop,
one restart a minute.</p>
<pre><code>docker compose pull &amp;&amp; docker compose up -d
docker compose logs -f gohead</code></pre>
<p><code>docker-compose.yml</code> pins the minor (<code>0.7</code>), so a fresh clone can't land in this; <code>docker
compose pull</code> moves it forward, and <code>GOHEAD_VERSION=0.8 docker compose up -d</code> picks another line. If
<code>gohead</code> is a binary on your PATH rather than the container, it's the same cause — <code>gohead
version</code> tells you what you have.</p>

<h2 id="trouble">When <code>npm install</code> fails with <code>UNABLE_TO_GET_ISSUER_CERT_LOCALLY</code></h2>
<p>That's TLS interception — a corporate proxy or a security agent re-signing HTTPS with its own root. macOS trusts that
root, Node doesn't, so the browser works and <code>npm</code> doesn't. Nothing in this repo needs changing. Either:</p>
<pre><code># Node 22.15+ / 24+: trust the system keychain
NODE_OPTIONS=--use-system-ca npm install

# or point Node at the proxy's root certificate
NODE_EXTRA_CA_CERTS=/path/to/corporate-root.pem npm install</code></pre>
<p>Don't reach for <code>strict-ssl=false</code>: it turns off the check instead of fixing it.</p>

<h2 id="model">Content model</h2>
<p><code>gohead/model.json</code> is the whole thing. Collections: <code>rooms</code>, <code>locations</code>,
<code>devices</code>, <code>cables</code>, <code>maintenance</code>, <code>clients</code>, <code>bookings</code>.
Components: <code>port</code>, <code>patch_point</code>, <code>channel_strip</code>. Cables point at a device and a port
<em>by name</em>, which is why renaming a port that a cable uses is refused.</p>
<p>Change the model and push it with <code>npm run gohead:push</code>; add <code>-- --dry-run</code> first to see what it
would do, and <code>-- --allow-removals</code> when you really mean to drop a field.</p>`,
  { wide: true },
);

// ---- Write ----

mkdirSync(DOCS, { recursive: true });
writeFileSync(resolve(DOCS, ".nojekyll"), "");
for (const [file, html] of [
  ["index.html", home],
  ["guide.html", guide],
  ["setup.html", setup],
]) {
  writeFileSync(resolve(DOCS, file), html);
  console.log(`docs/${file}  ${(html.length / 1024).toFixed(1)} kB`);
}
console.log(`${Object.keys(TOPICS).length} chapters, ${Object.keys(GLOSSARY).length} glossary entries.`);
