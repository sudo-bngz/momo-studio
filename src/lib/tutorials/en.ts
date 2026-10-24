/**
 * The walkthroughs, in English. The source the French is translated from.
 *
 * The examples use the gear that is actually in the studio, because a
 * walkthrough with "Synth A" in it teaches nothing.
 */
import type { Tutorials } from "./types";

export const en: Tutorials = {
  // ------------------------------------------------------------------
  gs3: {
    title: "Tracking a session on the GS3",
    blurb: "From an empty desk to a recall sheet you can set the console back from in ten minutes — and why the in-line routing surprises everyone once.",
    time: "About half an hour the first time, ten minutes after that.",
    needs: [
      "The desk entered as an asset, category **Mixer**, with its ports filled from the **Allen & Heath GS3 24/8/2** template. That gives you 163 correctly named sockets; without them the console page has nothing to draw.",
      "The Fireface and the instruments entered too, even roughly. A channel whose source isn't in the app can still be labelled, but nothing can be traced through it.",
      "The desk open at **Consoles → Allen & Heath GS3**.",
    ],
    steps: [
      {
        title: "Decide the channel list before you touch the desk",
        body: [
          "Twenty-four channels sounds like plenty until the Virus and the two drum machines have taken six of them in stereo pairs. Work out the list first, on paper or straight into the scribble strips here, and keep it stable between sessions — the whole point of a recall sheet is that channel 6 is the same thing next month.",
          "A list that works for this room: **1** Juno-106, **2** Juno-6, **3** Minitaur, **4** DX7, **5** Solina, **6** MB33, **7–8** Virus TI2 L/R, **9–10** RD-9 L/R, **11–12** RD-8 L/R, **13** TD-8 mix, **14** MPC, **15–16** Eurorack L/R, **17–20** spare for the Push 2 session and anything hired in, **21–22** Space Echo return, **23–24** 2-track return.",
        ],
        doThis: [
          "Click a channel's scribble strip and type the name. Tab moves to the next one.",
          "Or copy the whole column out of your old spreadsheet and use **Paste from a sheet** → *Labels*, starting at channel 1.",
          "Give the drum channels a colour so the pairs read at a glance.",
        ],
        aside: {
          kind: "why",
          text: "The label is a strip, not a port. Renaming channel 6 changes what this session calls it; it does not move a cable. That separation is what lets the recall sheet change every week while the back panel stays put.",
        },
      },
      {
        title: "Say which socket is actually live",
        body: [
          "Every GS3 channel has a Mic in, a Line in and a Tape in, and in a studio like this two or three of them are wired permanently. The app cannot guess which one is carrying signal today, and if it guesses wrong every trace through that channel is wrong.",
          "So each strip has a **source in use**: Mic, Line or Tape. Set it per channel. The amber dot on the strip is the app telling you more than one socket is wired and it is going with what you said.",
        ],
        doThis: [
          "On each strip, pick Mic / Line / Tape under the scribble strip.",
          "Everything in this room on a Line in — so set the whole bank to Line and only change the channels you actually mic.",
        ],
        aside: {
          kind: "why",
          text: "This is the in-line desk showing itself. The channel path (Mic or Line → preamp → insert → EQ → fader) and the monitor path (Tape in, its own level) are two signals in one strip. When you are tracking you record down the channel path and listen on the monitor path, which is why the Tape in exists on every channel and why the question has to be asked.",
        },
      },
      {
        title: "Set the gain with PFL, not with the fader",
        body: [
          "Pre-fade listen is the control you reach for first and the one that is easiest to forget is there. Press PFL on a channel and that channel goes to the control room and the headphones, tapped before the fader and before the mute. Nothing downstream changes: the groups, the mix and the auxes never see it.",
          "That is why it is the right tool for setting a gain. Put PFL up, play the loudest thing the Juno is going to do, bring the gain up until the meter sits where you want it, drop PFL. The fader has not moved and the mix has not moved.",
        ],
        doThis: [
          "Turn the **Gain** knob on the strip to match what you set on the desk.",
          "Click **PFL** on the strip while you are listening to it, and click it off again when you are done.",
          "Set the **Fader** last, and only for the mix.",
        ],
        aside: {
          kind: "watch",
          text: "The board lists which channels have PFL up, because a PFL left on is the usual reason the control room sounds like one instrument while the mix is perfectly fine. Check that list before you blame a cable.",
        },
      },
      {
        title: "Route the channel, and meet the track outs",
        body: [
          "This is the part of the GS3 that catches everyone exactly once. The desk is 24/8/2 — twenty-four channels, eight groups, a two-track mix — and it has **no group output sockets**. The eight group buses are paralleled onto the channels' Track Outs: group *g* appears on the Track Out of channels *g*, *g*+8 and *g*+16. Group 1 comes out of the Track Out of channel 1, or 9, or 17. Group 8 out of channel 8, 16 or 24.",
          "So when you route channel 13 to **Grp 1-2** and the app says the signal leaves by “Ch 1 Track Out, Ch 9 Track Out, Ch 17 Track Out”, it is not confused — those are the three jacks group 1 physically lands on, and the signal is at whichever of them you have patched to the Fireface. Pick one per group and stick to it: track outs 1–8 to the first eight Fireface inputs is the obvious choice, and it leaves channels 9–24's track outs free as direct outs.",
          "For a straightforward multitrack session you do not need the groups at all. Route every channel to **Direct out** and each channel's own signal leaves by its own Track Out, one channel per interface input. Use the groups when you want eight stems instead of twenty-four tracks, or when you want one fader over the whole drum machine.",
        ],
        doThis: [
          "On each strip, set **Routing**: *Direct out* for a track per channel, *Grp 1-2* … *Grp 7-8* for stems, *Mix L/R* for anything going only to the monitors.",
          "Read the little diagram beside the strip: it lights the path the signal actually takes with the settings you have given it, and names the sockets it leaves by.",
          "Patch the track outs you decided on as cables, under the desk's ports, so the plan can follow them.",
        ],
        aside: {
          kind: "why",
          text: "The app works this out from the ports rather than from a rule about the GS3: a desk that has “Group n” sockets but none of them an output is treated as in-line, and the group is followed onto the track outs. Enter a split desk and it behaves like a split desk.",
        },
      },
      {
        title: "Write down the EQ, including the two sweeps",
        body: [
          "Three bands. HF is a shelf fixed at 12 kHz. The mid is swept, 300 Hz to 12 kHz. LF is swept too, 20 Hz to 600 Hz. All three cut and boost by up to 14 dB. There is no pad and no phase switch on this desk, so you will not find one here either.",
          "The two swept bands are the ones worth being fussy about. “Mid up 4” means nothing in a month if you did not also write down that the sweep was at 2.5 kHz. Both knobs are on the strip; set the frequency first, then the amount, same order as on the desk.",
        ],
        doThis: [
          "Drag a knob, or roll the wheel over it. Hold **Shift** while dragging for fine control.",
          "Or click a knob and use the arrow keys; **Home** and **End** go to the extremes.",
          "Leave a band at centre if you did not touch it — a knob at centre reads as “not used” on the sheet.",
        ],
      },
      {
        title: "Put the compressor in an insert, not in line",
        body: [
          "The xpressor on channel 9 belongs in that channel's insert: one TRS jack, tip send, ring return, **pre-EQ** on this desk. Patch it that way and the compressor is inside channel 9's chain. Follow the signal in the patch plan and it goes Juno → channel 9 → xpressor → back into channel 9 → EQ → fader → track out, which is what is really happening.",
          "Patch it as a separate box in the signal path instead and the plan draws it as an island, because that is all it can see. The insert is the only way to tell the app that a piece of outboard is *inside* a channel.",
        ],
        doThis: [
          "Add a cable from **Ch 9 Insert** to the compressor's input, and one back from its output to the same insert.",
          "On the strip, the insert shows as wired once both cables are in.",
        ],
        aside: {
          kind: "watch",
          text: "Pre-EQ means the compressor hears the signal before your EQ, so a big low-end boost will not drive it harder. If you want the opposite, the EQ has to happen before the desk.",
        },
      },
      {
        title: "Send to the Space Echo, and watch for the loop",
        body: [
          "Auxes 1 to 4 are post-fade, on two dual-concentric spindles — 1 over 2, 3 over 4. Auxes 3 and 4 can be switched to follow the monitor path instead; the app does not model the switch, it models what the switch causes.",
          "Send channel 11 to Aux 2, patch **Aux 2 Out** to the RE-201's input, and bring the Space Echo back into a spare channel's line in — 21 and 22 in the list above. Now the important bit: **if the channel the echo returns on also sends to Aux 2, you have built an oscillator.** The app finds this. The returning channel turns red, the warning above the board names the aux and the channels in the ring, and it tells you which send to pull down.",
          "This is worth setting up deliberately once, just to see the warning fire, because the real version of this happens at two in the morning with a client in the room.",
        ],
        doThis: [
          "Open the aux knobs on the strip for the channels you want in the echo.",
          "Patch **Aux 2 Out** → RE-201 input, and RE-201 output → the return channel's line in, as cables under the desk's ports.",
          "Leave the return channel's Aux 2 at zero.",
        ],
        aside: {
          kind: "watch",
          text: "The RE-201 has one output jack, carrying the wet and the dry together, so there is no wet-only return to be had: the dry you send it comes back with the echo. Either accept it and pull the original channel down, or keep the Space Echo as an insert on one channel instead of an aux send for the room. (Worth a look at your own unit before you trust this — the template says one output.)",
        },
      },
      {
        title: "Save the sheet, print the strip, and come back to it",
        body: [
          "This is the whole reason the strip here has knobs on it. The GS3 is analogue: when the session ends, the settings are gone unless somebody wrote them down. What you have set — gain, three bands and two sweeps, four auxes, cue, pan, PFL, mute, fader, routing and label — is stored with the channel and is there next time you open the desk.",
          "Print the scribble strip and tape it over the faders. It carries the channel number, the label and the routing, at the desk's own spacing. A4 landscape, margins off, 100 % — any scaling and the names stop lining up.",
        ],
        doThis: [
          "**Print strip** at the top of the console page.",
          "Next session: open the desk, read the sheet, set the knobs back on the hardware to match.",
          "When something has moved for good, change it here too — every save is a revision, so you can see what the desk looked like last Tuesday.",
        ],
      },
    ],
    wrap: "You now have a desk that documents itself: who is on which channel, which socket is live, where every channel leaves by, and every knob position. The next step is making the patchbays carry all of it, which is the other walkthrough.",
    see: ["console", "consoles", "console-strip", "plan"],
  },

  // ------------------------------------------------------------------
  patchbay: {
    title: "Wiring the three patchbays",
    blurb: "144 jacks, a convention that survives contact with a session, and a patch plan that can trace from the Juno to the monitors without a gap.",
    time: "An afternoon with a soldering iron; an hour in the app.",
    needs: [
      "The three bays entered as assets, category **Patchbay**, ports filled from the **48-point patchbay** template. That gives each one 24 columns — 48 jacks, a Top *n* and a Bottom *n* rear point per column.",
      "The desk and the Fireface entered, with their ports — the bays mostly exist to reach those two.",
      "A decision about which bay does what, which is step one.",
    ],
    steps: [
      {
        title: "Give each bay a job",
        body: [
          "Three 48-point bays is 144 jacks in 72 columns, and the difference between a bay you can use at speed and one you squint at is whether each bay has one job. Mixed-up bays are the reason people stop using patchbays and go back to crawling behind the rack.",
          "The split that fits this room: **Patchbay I** is the desk — track outs on top, tape ins and line ins on the bottom. **Patchbay II** is the Fireface — its outputs on top, its inputs on the bottom. **Patchbay III** is everything else: the instruments' outputs on top, the outboard and the Eurorack on the bottom. Bays I and II live in Rack A so the desk and the interface meet in one place; III is in Rack B with the synths and the modules.",
        ],
        doThis: [
          "Rename the three assets to say what they are — “Desk bay”, “Interface bay”, “Instrument bay” beats “Patchbay I”.",
          "Put each in its rack on the **Racks** page so the map is right.",
        ],
      },
      {
        title: "Top row sources, bottom row destinations — everywhere, no exceptions",
        body: [
          "This is a convention, not a rule the hardware knows, and the app does not enforce it. Adopt it anyway and keep it across all three bays: **the top row is always something coming out of a machine, the bottom row is always something going into one.** Then a patch cord always runs top to bottom, and you can read the bay without thinking.",
          "The moment one bay has it the other way round is the moment you start plugging outputs into outputs at the end of a long night.",
        ],
        aside: {
          kind: "why",
          text: "It also makes the normalling make sense. A normalled column with a source on top and a destination underneath is a tie-line that is connected until you interrupt it — which is exactly what you want a patchbay to be most of the time.",
        },
      },
      {
        title: "Patch the backs in, as cables",
        body: [
          "The rear points are ports like any other: **Top 12** and **Bottom 12** on the bay, and a cable from each to whatever it is soldered to. This is the long boring part and it is the part that makes everything else work, because the patch plan can only follow what it knows about.",
          "Work a column at a time, down the list. Track Out 1 → Top 1. Track Out 2 → Top 2. Tape In 1 → Bottom 1. It is repetitive by design: a bay where Top 7 is the seventh thing in the list is a bay you can use in the dark.",
        ],
        doThis: [
          "**Cables → New**, or add them from the bay's own page.",
          "Name the column as you go — the column name is what the board and the printed strip show.",
          "Use words, not numbers: “Juno 106”, “Comp in”, “Echo send”. “Top 23” tells you nothing at the moment you need it.",
        ],
        aside: {
          kind: "watch",
          text: "These are 1/4\" TRS bays, so a column can carry a balanced line or an unbalanced one, and nothing physical stops you plugging an insert send into a mic line. The app will tell you when a cable's signal does not match the port's — that warning exists because the hardware will not.",
        },
      },
      {
        title: "Choose each column's mode, and mean it",
        body: [
          "Three modes, and the choice changes what the bay does when nothing is plugged into the front.",
          "**Normal** — top and bottom are joined behind the panel. The signal flows without a cord. Plugging into either front jack breaks the link and takes over. This is the default for a tie-line: Track Out 1 reaches Tape In 1 by itself, and when you want it somewhere else you plug in and it stops going to Tape In 1.",
          "**Half-normal** — joined as well, but the **top** front jack only takes a copy; the link stays. Only the bottom jack breaks it. This is the one you want for taking a feed somewhere without killing where it already goes: plug into the top of the RD-9's column and the drum machine still reaches the desk *and* now also feeds the Space Echo.",
          "**Thru** — not joined at all. Each rear point reaches only its own front jack, and nothing moves until you put a cord in. Use it for things that must never be connected by accident: a power amp input, a CV destination, the insert returns.",
        ],
        doThis: [
          "Set the mode per column on the bay's page — the badge reads **N**, **H** or **T**.",
          "Make the desk-to-interface tie-lines **normal**, the instrument outputs **half-normal**, and anything that bites **thru**.",
          "Match whatever the actual bay is wired or switched to. The app believes you.",
        ],
        aside: {
          kind: "why",
          text: "The patch plan follows a signal through a normalled or half-normalled column as if the two points were one wire, and stops dead at a thru column — because in real life it does too. A trace that stops at a thru column is the app being right, not a missing cable.",
        },
      },
      {
        title: "Fill the names from the spreadsheet instead of typing them",
        body: [
          "If the bays are already labelled somewhere — a spreadsheet, a text file, the photo of the old strip — you do not have to retype seventy-two column names. Copy a column of cells and drop them in.",
          "You can paste names, modes, or both, starting at whichever column you choose, so a bay that is half done can be finished from a partial list.",
        ],
        doThis: [
          "**Paste from a sheet** on the bay's page.",
          "Pick which column the first value lands on, and whether you are pasting names or modes.",
          "Check the preview before you commit — it shows you what is about to change.",
        ],
      },
      {
        title: "Print the strips and get them on the bay",
        body: [
          "A bay with no labels is a bay nobody uses. Print one strip for the top row and one for the bottom, at the bay's own jack spacing, and slide them in.",
          "A 24-column bay is wider than a sheet of paper, so the strip comes out in pieces you tape end to end — the subtitle on the print page tells you how many. Print at 100 % with margins off. Any scaling at all and the names drift away from the jacks they belong to, which is worse than no strip.",
        ],
        doThis: [
          "**Print strip** on the bay's page, once for each row.",
          "Cut along the line, tape the pieces, slide them above and below the jacks.",
        ],
      },
      {
        title: "Prove it with the patch plan",
        body: [
          "Now the check that tells you whether the wiring you entered is the wiring you have. Open **Plan**. Everything connected is drawn left to right in the direction the sound moves: sources on the left, the monitors on the right.",
          "Find the Juno-106 and follow it. It should run Juno → instrument bay → desk bay → a GS3 channel → that channel's track out → interface bay → Fireface, and come back out through the desk to the ADAM A7s. If the line stops somewhere, the gap is real: either a cable you have not entered, a column you called thru that is actually normalled, or a channel whose source in use is set to the wrong socket.",
          "Click into an asset first and the plan draws only that machine and what it reaches, in both directions, which is the fastest way to chase one signal through three bays.",
        ],
        doThis: [
          "**Plan**, then hover a cable to see how many machines the signal has already been through.",
          "Red lines are loops. Through a pedal that is sometimes what you want; through an aux it almost never is.",
          "Fix what the gaps show you, then run it again.",
        ],
        aside: {
          kind: "watch",
          text: "The trace stops at anything that does not pass a signal on — an interface, a monitor, a recorder — and at a socket it has already been through. That last one is why a signal can cross the same bay three times without the plan spinning forever.",
        },
      },
    ],
    wrap: "Three bays with one job each, a convention that holds, modes that match the solder, printed strips, and a plan that traces end to end. From here, repatching is editing a cable in the app and moving one cord in the rack — and next week you will still know what Top 23 is.",
    see: ["patchbays", "patchbay", "patchbay-strip", "cables", "plan"],
  },
};
