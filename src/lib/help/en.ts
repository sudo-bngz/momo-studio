/**
 * The manual, in English. This is the source the French is translated from,
 * and the fallback for anything French has not reached yet.
 *
 * The text describes what the code actually does — when you change behaviour,
 * change the topic with it.
 */
import type { HelpContent } from "./types";

export const en: HelpContent = {
  topics: {
  // ---- The idea ----
  model: {
    title: "How the pieces fit",
    lede: "Everything here is three things: assets, locations and cables. Every other page is a way of looking at those three.",
    points: [
      { term: "Asset", text: "One piece of gear, with its ports. A port is a physical socket: a name, a direction (in, out or both), a signal and a connector. The ports are the back panel — they change when you rewire the machine, not between sessions." },
      { term: "Location", text: "Where an asset sits: a rack, a desk, a shelf, a wall, a case. A location belongs to a room and has a position and size in centimetres, which is what the studio map draws." },
      { term: "Cable", text: "One run between two ports: from an asset and a port name, to an asset and a port name. The cable is what the patch plan follows, and what the issue list checks." },
      { term: "Everything else", text: "Patchbays, consoles, the plan, the map and the labels hold no data of their own. They read the same assets and cables and show them in the shape you think in." },
    ],
    long: [
      "Because cables point at a port by its name, renaming a port that a cable uses is refused: the cable would be left pointing at nothing. Re-point the cable's end first, or delete it and re-patch.",
      "Two kinds of asset carry a little extra. A patchbay has columns, and each column can be normalled, half-normalled or thru. A console has channel strips: the label, source, routing and aux sends of each channel. Both exist so the app can follow a signal through the machine instead of stopping at it.",
    ],
    see: ["assets", "cables", "plan"],
  },

  // ---- Overview ----
  overview: {
    title: "Overview",
    lede: "The state of the studio in one screen: what's booked, what's patched, what's broken and what needs attention.",
    points: [
      { term: "Counts", text: "Assets owned, their total value, cables connected, and what the plan found wrong. Each one links to the page it came from." },
      { term: "Needs attention", text: "Machines away for repair or on loan, warranties about to end, and anything the patch plan found wrong. Empty means every machine is home and the plan is coherent." },
      { term: "Maintenance", text: "The last jobs logged against a machine — a repair, a service, a calibration, a re-cap — newest first." },
      { term: "Next 14 days", text: "Every session in the fortnight ahead, with its room, its client and the machines it needs." },
    ],
    see: ["plan", "bookings"],
  },

  // ---- Assets ----
  assets: {
    title: "Assets",
    lede: "Every machine in the studio — synths, expanders, interfaces, pedals, the desk, the patchbays, the computers — with its ports, its place and its photos.",
    points: [
      { term: "Gallery and Table", text: "The same assets either as cards with their photo or drawing, or as a table you can scan and sort. The filters stay when you switch." },
      { term: "Code", text: "The short code you write on the machine and on its cable labels. Keep it short: it's printed at label size." },
      { term: "Drawing", text: "An asset with no photo is drawn from its category and its size, so a rack of unphotographed gear still reads at a glance. Add a photo and the photo wins." },
      { term: "State", text: "In use, spare, in repair, loaned, for sale, sold. Sold assets are left out of the patch plan and the map; everything else is drawn." },
      { term: "Ports", text: "The sockets on the machine. Everything downstream — patching, the plan, the console view, cable labels — reads these, so they're worth getting right once." },
    ],
    steps: [
      "Add the asset, choose its category and give it a code.",
      "Fill the ports from a template if there is one for it, then correct what differs.",
      "Put it in a place so it appears in the right rack and on the map.",
      "Drop in a photo or two — the first one is the cover.",
    ],
    see: ["asset-form", "racks", "cables"],
  },

  asset: {
    title: "One asset",
    lede: "Everything about one machine: its photos, its place, its ports and what is plugged into each of them.",
    points: [
      { term: "Ports", text: "Each socket with its direction, signal and connector, and the cable on it if there is one. A free port offers to patch it." },
      { term: "Patch it →", text: "Starts a new cable with this port already filled in, so you don't have to find the asset again." },
      { term: "Show in plan", text: "Opens the patch plan centred on this asset, with what feeds it and what it feeds." },
      { term: "Maintenance", text: "The jobs logged against this machine, newest first." },
    ],
    see: ["assets", "cables", "plan"],
  },

  "asset-form": {
    title: "Adding and editing an asset",
    lede: "The identity of the machine, where it lives, and its ports. Ports are the part that matters: everything else in the app reads them.",
    points: [
      { term: "Fill the ports", text: "Pick a template and the ports are written for you — the Allen & Heath GS3 24/8/2 fills 163 of them, correctly named. Then fix whatever your unit differs on." },
      { term: "Port name", text: "Free text, but the names carry meaning. “Ch 7 Line”, “Ch 7 Insert”, “Ch 7 Track Out” make channel 7 of a console. “Top 12” and “Bottom 12” make column 12 of a patchbay. Anything else is just a socket." },
      { term: "Direction", text: "In, Out or In/Out. The plan uses it to check you haven't joined two outputs, and to know which way a signal travels." },
      { term: "Signal", text: "Audio, MIDI, CV, gate, clock, digital audio, USB, network, power, control. Mismatches between a cable and the port it lands on are reported, not blocked — sometimes you really do send CV down an audio cable." },
      { term: "Photos", text: "Up to eight, resized in the browser before upload so a phone photo doesn't cost you megabytes. The first is the cover; drag to reorder." },
      { term: "Renaming a patched port", text: "Refused while a cable uses it, because the cable stores the name. Move the cable first." },
    ],
    see: ["assets", "console"],
  },

  // ---- Places ----
  racks: {
    title: "Racks & places",
    lede: "Every rack, desk, shelf, wall and case, with what's in it — read top to bottom the way you'd look at the rack itself.",
    points: [
      { term: "Rack units", text: "A location with a height in U draws its slots, so you can see what's free before you buy the next 1U box. Positions count from U1 at the top." },
      { term: "Room", text: "Locations belong to a room. The map draws one room at a time." },
      { term: "Position", text: "The x and y in centimetres, and the size and rotation, are what the studio map uses. A location with no position is laid out automatically." },
    ],
    see: ["places", "map", "assets"],
  },

  places: {
    title: "Rooms & locations",
    lede: "Rooms are what you book; locations are where the machines sit. Sizes are in centimetres, measured however you like as long as you're consistent.",
    points: [
      { term: "Room size", text: "Width and depth in cm. The map scales to fit, so a rough measurement still gives a usable plan." },
      { term: "Location position", text: "x and y in cm from the room's top-left corner, plus a rotation in degrees for anything at an angle." },
      { term: "Rack units", text: "Give a rack its height in U and the racks page draws its slots." },
      { term: "Colour", text: "A room's colour tints its bookings in the calendar and its outline on the map." },
    ],
    see: ["racks", "map"],
  },

  map: {
    title: "Studio map",
    lede: "The room from above: where each place stands, what's in it, and the cable runs between them. Click a place to zoom into it.",
    points: [
      { term: "Scale", text: "Real centimetres. A place drawn small really is small — the zoom exists because a 50 cm pedalboard can't carry ten labels at room scale." },
      { term: "Bundles", text: "Cables between the same two places are drawn as one run, labelled with how many cables it carries. That's the thing you actually trip over." },
      { term: "Zoom into a place", text: "Draws that place alone, large, with every asset in it and every cable entering or leaving, named." },
      { term: "A place with no position", text: "Gets laid out automatically along the room's edges. Set x and y on it to pin it where it really is." },
    ],
    see: ["places", "plan"],
  },

  // ---- Cables ----
  cables: {
    title: "Cables",
    lede: "Every run in the studio, and the list of everything wrong with the current patch.",
    points: [
      { term: "Code", text: "What you write on the label at both ends. Printable from Cable labels." },
      { term: "State", text: "Connected, spare or broken. Only connected cables are followed by the plan and checked for issues." },
      { term: "Issues", text: "Checked on every load, never blocking: you can always save a patch the app disagrees with." },
      { term: "busy port", text: "Two or more cables on one socket. Fine on a passive mult or a stacked Eurorack jack, a mistake nearly everywhere else — so it's a warning, not an error." },
      { term: "direction", text: "The cable joins two inputs or two outputs. Usually a typo in one end." },
      { term: "signal mismatch", text: "The cable says audio and the port says MIDI, or similar. Worth a look, sometimes deliberate." },
      { term: "unknown port", text: "The asset has no port by that name any more — someone renamed or removed it. Re-point the cable." },
      { term: "missing device", text: "The asset at one end was deleted. The cable is now dangling." },
      { term: "loose end", text: "The cable is marked connected but one end was never filled in." },
      { term: "loop", text: "The signal comes back to where it started. Nearly always an aux send returning into a channel that feeds the same aux — see the console chapter." },
    ],
    steps: [
      "Pick the source asset, then its port; the list only offers ports that exist.",
      "Pick the destination the same way.",
      "Give it a code, a length and a colour if you label by colour.",
      "Leave it connected, or mark it spare if it's coiled on the wall.",
    ],
    see: ["plan", "patchbays", "console"],
  },

  "cable-form": {
    title: "Patching a cable",
    lede: "A cable is an asset and a port at each end. Pick the asset first and the port list narrows to what that machine actually has.",
    points: [
      { term: "Pre-filled ends", text: "Arriving here from a free port on an asset, patchbay or console fills that end in for you." },
      { term: "Signal", text: "Defaults from the source port. Change it if the cable carries something else." },
      { term: "Length", text: "In metres. Used in the label print and to total up what a run costs you in cable." },
    ],
    see: ["cables", "cable-labels"],
  },

  "cable-labels": {
    title: "Cable labels",
    lede: "A printable sheet of labels for the cables you select — code, both ends and the signal, at a size that fits a cable tie.",
    points: [
      { term: "Filtering", text: "Arriving from an asset prints only that machine's cables. Otherwise you get every connected cable." },
      { term: "Printing", text: "Print to A4 with margins off. Each label shows the code large and both ends small, so it reads the same whichever end you pick up." },
    ],
    see: ["cables"],
  },

  // ---- Patchbays ----
  patchbays: {
    title: "Patchbays",
    lede: "Each patchbay as the board it is: a row of columns, each with a top and a bottom point, and a mode that says how the two are joined.",
    points: [
      { term: "Column", text: "One vertical pair. Its rear points are named “Top 12” and “Bottom 12”; its front jacks are what you plug a cord into." },
      { term: "Normal", text: "Top and bottom are wired together behind the panel. Plugging into either front jack breaks the link and takes over." },
      { term: "Half-normal", text: "Wired together as well, but the top front jack only takes a copy — the link stays. Only the bottom front jack breaks it. This is the one you want for tapping a send without killing it." },
      { term: "Thru", text: "Not joined at all: each rear point reaches only its own front jack. Patch it with a cord." },
      { term: "Why it matters here", text: "The plan follows a signal through a normalled or half-normalled column as if the two points were one wire. A thru column stops it, because in real life it does too." },
    ],
    steps: [
      "Patch the rear points as cables to Top n and Bottom n, like any other port.",
      "Set each column's mode to match the switch or the wiring on the actual bay.",
      "Name the column so the board reads in words — “Prophet L”, “Comp in” — rather than in numbers.",
    ],
    see: ["patchbay", "cables", "plan"],
  },

  patchbay: {
    title: "One patchbay",
    lede: "The board, column by column: what's wired to the back, how the column is normalled, and what's patched on the front.",
    points: [
      { term: "Top and bottom rows", text: "What the rear of each column is wired to. By convention the top row is sources and the bottom row destinations, but nothing here enforces it." },
      { term: "Mode badge", text: "N, H or T on each column — normal, half-normal or thru." },
      { term: "Paste from a sheet", text: "Copy a row of cells out of your old spreadsheet and drop it in: names, modes or both, from whichever column you choose." },
      { term: "Print strip", text: "A paper strip sized to the bay, to slide above or below the jacks." },
    ],
    see: ["patchbays", "patchbay-strip"],
  },

  "patchbay-strip": {
    title: "Printing a patchbay strip",
    lede: "The column names as a paper strip at the bay's own spacing — one strip for the top row, one for the bottom.",
    points: [
      { term: "Pieces", text: "A bay wider than the paper is split into pieces you tape end to end. The count is in the subtitle." },
      { term: "Printing", text: "Print at 100 % with margins off — any scaling and the names stop lining up with the jacks." },
    ],
    see: ["patchbay"],
  },

  // ---- Consoles ----
  consoles: {
    title: "Consoles",
    lede: "Each desk drawn as its channel strips: what's plugged into every channel, what it's called, where it's routed and which socket it leaves by.",
    points: [
      { term: "A strip", text: "One channel, top to bottom: scribble strip, what's in its mic / line / tape sockets, its insert, its routing, and what its output is wired to." },
      { term: "Amber dot", text: "The source you said is in use on that channel, when more than one socket is wired." },
      { term: "Red strip", text: "That channel is part of a feedback loop. The warning above says which aux." },
      { term: "Master section", text: "Everything that isn't a channel — groups, auxes, cue, mix, FX returns, 2-track, monitors, headphones, MIDI, power — with what each socket is wired to." },
    ],
    see: ["console", "cables"],
  },

  console: {
    title: "The console, and the Allen & Heath GS3",
    lede: "The desk has two layers here: its ports, which are the back panel and never change, and its channel strips, which are what the desk is doing today.",
    points: [
      { term: "Ports vs strips", text: "A port is a socket you can patch a cable into. A strip is a label, a source, a routing and a set of aux sends — the session, not the hardware. Repatching means editing cables; renaming a channel means editing a strip." },
      { term: "Source in use", text: "Mic, line or tape. A GS3 channel has all three wired at once often enough that the app can't guess; telling it which one is live is what makes the trace follow the right path." },
      { term: "Routing", text: "Direct out, group pairs, mix L/R, or free text for anything odd. This is what decides which socket the channel's signal leaves the desk by." },
      { term: "Aux sends up", text: "Which auxes this channel feeds. Used for one thing above all: catching an aux that comes back into a channel sending to the same aux." },
      { term: "Insert", text: "Tip send, ring return. A compressor patched into channel 4's insert shows up inside channel 4's chain when you trace it, not as a separate island." },
      { term: "Track Out", text: "On an in-line desk like the GS3 this socket does two jobs — the channel's direct out, or a group. Which one depends on the routing you set." },
      { term: "Paste from a sheet", text: "One column at a time — labels, sources, routings, auxes, notes — starting at whichever channel you choose. The old spreadsheet goes in in four pastes." },
    ],
    long: [
      "**The GS3 is an in-line desk, and that is the whole reason it needs explaining.** On a split desk, each group has its own output jack: you route a channel to Group 3 and you take Group 3 out of the socket marked Group 3 Out. The GS3 24/8/2 has 24 channels, 8 groups and a 2-track mix, but no group output sockets at all. The eight group buses are paralleled onto the channels' Track Outs: group *g* appears on the Track Out of channels *g*, *g*+8, *g*+16. Group 1 comes out of the Track Out of channel 1, 9 or 17; group 8 out of channel 8, 16 or 24. The same 24 jacks carry either a channel's own direct signal or a group, depending on how the strip is switched.",
      "So when you tick “Grp 1-2” on channel 17 and the app tells you the signal leaves by “Ch 1 Track Out, Ch 9 Track Out, Ch 17 Track Out”, that is not a bug — those are the three sockets group 1 lands on, and whichever of them you have wired to your interface is where the signal is. The app works this out from the ports: a desk with “Group n” sockets but none of them an out is treated as in-line, and the group is followed onto the track outs.",
      "**Each channel carries two paths.** The channel path takes the Mic or the Line input, through the preamp, the insert, the EQ and the big fader. The monitor path takes Tape In, at its own level. When tracking you record through the channel path and listen on the monitor path, which is why every GS3 channel has a Tape In and why the app asks which source is in use rather than assuming the one that happens to be wired.",
      "**The insert is pre-EQ** and wired tip send, ring return on a single TRS jack. In the app the insert is a port with direction In/Out: a signal that arrives there leaves by whatever the strip's routing says, so the outboard you patch into it becomes part of that channel's chain when you follow the signal rather than a dead end.",
      "**Auxes 1 to 4 are post-fade**, and 3 and 4 can be switched to follow the monitor path. The app doesn't model the switch — it models the consequence. If Aux 2 Out goes to a delay, the delay comes back into channel 7's line input, and channel 7's strip says it sends to Aux 2, you have built an oscillator. That is what the red strips and the loop warning are: the trace follows Aux 2 Out through every pedal and patchbay in the way, and if it arrives back at a channel that feeds Aux 2, it says so, names the channels and tells you which send to pull down.",
      "**The FX returns and the mix insert land on the mix.** A signal entering FX Return 3 leaves by Mix Out L and R, so a reverb returned there is followed through to the monitors rather than stopping at the return.",
      "**Filling the desk in.** Add the console as an asset with the category Mixer and fill its ports from the Allen & Heath GS3 24/8/2 template: 163 ports, correctly named, including the four auxes, eight group inserts, four stereo FX returns, two 2-track machines, both monitor pairs and the MIDI mute processor. The 16-channel GS3 is there too. If your unit differs — a modified insert, a dead channel — fix those ports by hand afterwards; the template is a starting point, not a contract.",
    ],
    see: ["consoles", "patchbays", "plan"],
  },

  "console-strip": {
    title: "Printing a scribble strip",
    lede: "The channel names as a paper strip, at the desk's own channel spacing, to tape over the faders.",
    points: [
      { term: "What's printed", text: "The channel number, the label and the routing, in channel order, with the strip's colour if it has one." },
      { term: "Printing", text: "A4 landscape, margins off. Cut along the line and tape it down." },
    ],
    see: ["console"],
  },

  // ---- Plan ----
  plan: {
    title: "Patch plan",
    lede: "Every connected cable as one diagram, ranked left to right by how far a signal has travelled — sources on the left, the monitors on the right.",
    points: [
      { term: "Ranking", text: "Each asset sits as far right as its longest path from a source. It's not a tidy grid, but it reads in the direction the sound moves." },
      { term: "Colours", text: "The signal's colour — audio amber, MIDI violet, CV green, clock pink, and so on. The legend is on the page." },
      { term: "Loops", text: "A cycle in the patch, found with a strongly-connected-components pass, drawn in red. Feedback through a pedal is sometimes what you want; through an aux it's rarely what you want." },
      { term: "Focus", text: "Arriving from an asset draws only that machine and what it reaches, in both directions." },
      { term: "Signal hops", text: "Hovering a cable counts how many machines the signal has already passed through. Useful when something sounds thinner than it should." },
    ],
    long: [
      "The plan follows a signal through anything that passes it on: a normalled or half-normalled patchbay column, a pedal or preamp or compressor, and a console's routing. It stops at anything that doesn't — an interface, a monitor, a recorder — and at a socket it has already been through, which is how a signal can cross the same patchbay three times without the trace spinning.",
    ],
    see: ["cables", "patchbays", "console"],
  },

  // ---- Bookings ----
  bookings: {
    title: "Bookings",
    lede: "The week as a grid, one column per day, tinted by room. Click a day to book it, a session to open it.",
    points: [
      { term: "Tentative", text: "Drawn dashed and pale: a hold, not a booking. Confirmed is solid." },
      { term: "Cancelled", text: "Struck through and kept, not deleted, so the week still tells you what happened." },
      { term: "Room filter", text: "Shown when there's more than one room; the chips keep the week you're looking at." },
      { term: "Income", text: "The week's prices added up, cancellations left out. Paid sessions are marked in the list below." },
      { term: "Calendar feed", text: "A subscribable .ics of every session. Set it up once with the access script, then subscribe in Google Calendar, Apple Calendar or anything else that takes a URL." },
    ],
    long: [
      "The feed is read-only and one-way: it shows your bookings in your calendar, it doesn't take events back. Subscribe to it at `/bookings.ics?key=…`, with the key the access script wrote into your environment. Google refreshes an external calendar on its own schedule — often hours — so treat it as the week in your pocket, not as something that updates the moment you confirm a session.",
    ],
    see: ["booking-form", "clients"],
  },

  "booking-form": {
    title: "Booking a session",
    lede: "A title, a room, a time, and whoever it's for. Everything else is optional.",
    points: [
      { term: "Overlaps", text: "Two sessions in the same room at the same time are flagged when you save. Nothing stops you — sometimes a setup overlaps a teardown." },
      { term: "Session type", text: "Recording, production, mixing, mastering, rehearsal, gear rental. Only used for reading back what the month was made of." },
      { term: "Price and paid", text: "Totalled per week on the bookings page; the paid flag is yours to keep honest." },
      { term: "Engineer", text: "Free text — who's running it." },
    ],
    see: ["bookings"],
  },

  clients: {
    title: "Clients",
    lede: "Who books the studio: name, artist name, how to reach them, and every session they've had.",
    points: [
      { term: "Artist name", text: "Shown in the calendar when it's there, because that's what you call them." },
      { term: "Sessions", text: "Counted and totalled per client, so you can see who actually comes back." },
    ],
    see: ["bookings"],
  },

  // ---- Ops ----
  activity: {
    title: "Activity",
    lede: "Every change ever made, by whom and when, with the before and after — and a way back to any earlier version.",
    points: [
      { term: "Where it comes from", text: "The CMS records a revision in the same transaction as the change itself. This page reads them. The trail can't drift from the data, and nothing can write to the data without being recorded." },
      { term: "Actor", text: "A person, an API token, an agent or the system. Tokens are named, so the calendar feed reading bookings looks like the calendar feed, not like you." },
      { term: "Filters", text: "By person, by what was changed, by the kind of change, by the kind of actor. Arriving from an account filters to that person." },
      { term: "Bring it back", text: "Shown on deleted entries. The entry comes back under its own id, so cables that pointed at it point at it again." },
      { term: "Restoring", text: "Recorded as a change in its own right, so a restore can be undone like anything else." },
    ],
    see: ["history", "people"],
  },

  history: {
    title: "One entry's history",
    lede: "Every version of this entry, and exactly which fields changed between any two of them.",
    points: [
      { term: "vs previous", text: "What that version changed, compared with the one before it." },
      { term: "vs now", text: "What that version would change, compared with the content as it stands. This is the one to read before restoring." },
      { term: "Restore", text: "Writes that version's content back as a new version. If it's already identical to what's there, you're told instead." },
    ],
    see: ["activity"],
  },

  people: {
    title: "Accounts",
    lede: "Who can sign in, and what they're allowed to do. These are the CMS's own users, so there's one list of people, not two.",
    points: [
      { term: "Roles", text: "An admin can do everything, including this page. studio-staff can read and write the studio's content and media and nothing else — no accounts, no settings. The access script creates that role." },
      { term: "Passwords", text: "Set when you create the account and shown once. Suggest one if you'd rather not invent it." },
      { term: "What they changed →", text: "Filters the activity trail to that person." },
      { term: "Why no shared login", text: "Each person signs in as themselves so the trail says who did what. A shared account or a shared token would make every change read as the same actor, which is the one thing the trail is for." },
    ],
    long: [
      "Signing in with Google is coming. GoHead grew OpenID Connect sign-in on `master` (authorization code flow with PKCE, `GET /auth/sso/google/start`), so it will be there in the release after v0.7.0 — which is the version this app's `docker-compose.yml` pins. This app doesn't use it yet: its login page still takes a username and a password. Wiring it up means offering a *Sign in with Google* button that hands off to GoHead and accepting the token it sends back, and it changes nothing else — the app only ever holds a GoHead token, so roles, permissions and this trail keep working untouched.",
    ],
    see: ["activity"],
  },
  },

  parts: {
  idea: { title: "The idea", blurb: "What the app is made of, and the one screen that summarises it." },
  gear: { title: "The gear", blurb: "Assets, their ports, and where they physically are." },
  wiring: { title: "The wiring", blurb: "Cables, the patchbays and the desk — and following a signal through all three." },
  business: { title: "The business", blurb: "Sessions, who they're for, and the calendar feed." },
  running: { title: "Running it", blurb: "Who can do what, and what everyone did." },
  },

  glossary: {
  normal: { term: "Normal", text: "A patchbay column whose top and bottom are wired together behind the panel. Plugging into either front jack breaks the link." },
  half_normal: { term: "Half-normal", text: "Wired together as well, but the top front jack takes only a copy and leaves the link alone. Only the bottom jack breaks it." },
  thru: { term: "Thru", text: "A column whose two points aren't joined: each reaches only its own front jack." },
  insert: { term: "Insert", text: "A single TRS jack carrying both a send (tip) and a return (ring), for putting outboard inside a channel. Pre-EQ on the GS3." },
  "in-line": {
    term: "In-line desk",
    text: "A desk whose channels carry both the channel path and the monitor path, and whose group buses come out of the channels' track outs rather than their own sockets. The GS3 is one.",
  },
  "track-out": { term: "Track out", text: "A GS3 channel's output socket. It carries that channel's direct signal, or a group — the routing decides which." },
  group: { term: "Group", text: "A bus several channels are routed to and controlled together. The GS3 has eight, paralleled onto the track outs of channels g, g+8, g+16." },
  aux: { term: "Aux send", text: "A separate mix taken off the channels, for effects or for a musician's headphones. Post-fade on the GS3." },
  "direct-out": { term: "Direct out", text: "A channel's own signal, straight out, bypassing the groups and the mix. On the GS3 it shares the track-out socket with the groups." },
  strip: { term: "Channel strip", text: "In this app: the label, source, routing, aux sends, colour and note of one channel. The session's state, not the hardware's." },
  port: { term: "Port", text: "One physical socket on a machine, with a name, a direction, a signal and a connector." },
  revision: { term: "Revision", text: "A recorded version of an entry, written by the CMS in the same transaction as the change." },
  },
};
