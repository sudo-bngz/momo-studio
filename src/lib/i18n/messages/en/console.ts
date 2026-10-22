/** The consoles, the channel strips and the scribble strip. */
export const console = {
  "console.meta.list": "Consoles",
  "console.meta.detail": "Console",
  "console.meta.strip": "Scribble strip",

  // The list of desks
  "console.list.title": "Consoles",
  "console.list.subtitle": "Every channel of the desk: what's plugged in, what it's called, where it goes.",
  "console.list.add": "Add a console",
  "console.list.edit": "Edit →",
  "console.list.empty":
    "No console yet. Add one as an asset with the category “{category}” and fill its ports from a template (the Allen & Heath GS3 is there), or name its ports “Ch 1 Line”, “Ch 1 Insert”…",

  // The shape of a desk, counted
  "console.shape.channels.one": "{count} channel",
  "console.shape.channels.other": "{count} channels",
  "console.shape.groups.one": "{count} group",
  "console.shape.groups.other": "{count} groups",
  "console.shape.auxes.one": "{count} aux",
  "console.shape.auxes.other": "{count} auxes",
  "console.shape.inUse.one": "{count} in use",
  "console.shape.inUse.other": "{count} in use",
  "console.shape.badge": "{ch} ch · {grp} grp · {aux} aux",
  "console.shape.fromPorts": "(from the ports)",

  // One desk
  "console.printScribble": "Print scribble strip",
  "console.editDevice": "Edit device",

  // Roles of a channel's sockets, drawn in a 71 px strip: keep them short
  "console.role.mic": "Mic",
  "console.role.line": "Line",
  "console.role.tape": "Tape",
  "console.role.tapeShort": "Tape",
  "console.role.insert": "Insert",
  "console.role.insertShort": "Ins",
  "console.role.out": "Out",

  // The board
  "console.socket.free": "{port}: free",
  "console.insert.none": "Insert: nothing",
  "console.legend.direct": "DIRECT",
  "console.legend.aux": "AUX {list}",
  "console.legend.mix": "→ MIX",
  "console.loopNote": "Red strips are part of an aux feedback loop: see the warnings above.",
  "console.groupNote": "In-line desk: groups come out of the track outs of channels g, g+{a}, g+{b}…",
  "console.why": "why →",

  "console.tab.one": "One channel",
  "console.tab.all": "All channels · paste from a sheet",
  "console.pickChannel": "Click a channel to name it, choose its source, route it and see what's plugged into it.",
  "console.save": "Save console",
  "console.channels": "Channels",
  "console.channel": "Channel {n}",

  // Editing one strip
  "console.field.label": "Label (scribble strip)",
  "console.field.label.placeholder": "Kick, Prophet, Vocal…",
  "console.field.source": "Source in use",
  "console.field.source.hint": "Which of the three is live, when more than one is wired. Tape is the channel's",
  "console.field.source.hintEnd": ".",
  "console.field.route": "Routing",
  "console.field.route.placeholder": "e.g. 1-2 + mix, or a note on the routing",
  "console.field.aux": "Aux sends up",
  "console.field.aux.hint": "Used to catch an aux coming back into a channel that feeds it.",
  "console.field.color": "Color",
  "console.field.note": "Note",

  "console.route.direct": "Direct out",
  "console.route.mix": "Mix L/R",
  "console.route.group": "Grp {g}",
  "console.route.hint.inline.a": "and the groups share this channel's",
  "console.route.hint.inline.b": ", so a group leaves by the track outs of the channels it is paralleled on.",
  "console.route.hint.split.a": "is this channel on its own; a",
  "console.route.hint.split.b": "leaves by its own output socket.",

  "console.term.monitorPath": "monitor path",
  "console.term.directOut": "Direct out",
  "console.term.trackOut": "track-out socket",
  "console.term.group": "group",

  "console.aux.n": "Aux {n}",
  "console.color.none": "None",
  "console.color.swatch": "Color {color}",

  "console.sockets": "Sockets of channel {n}",
  "console.noPorts": "No “Ch {n} …” ports on this device: add them (or refill from a template) in Edit device.",
  "console.leavesBy": "With this routing the signal leaves by",
  "console.leavesBy.end": ".",
  "console.leavesBy.many":
    "More than one socket because the group is paralleled across those channels' track outs — whichever one you have wired is where the signal is.",

  // Every strip, pasted from a sheet
  "console.paste.title": "Paste from a sheet",
  "console.paste.hint": "Copy a row of cells (channel names, routings like “1-2”, “mix”, “direct”, aux numbers…) and paste it here.",
  "console.paste.into": "Into",
  "console.paste.field.label": "Labels",
  "console.paste.field.source": "Sources (mic / line / tape)",
  "console.paste.field.route": "Routing",
  "console.paste.field.aux": "Aux sends",
  "console.paste.field.note": "Notes",
  "console.paste.from": "From channel",
  "console.paste.cells": "Cells",
  "console.paste.placeholder": "Kick\tSnare\tHats\tProphet L\t…",
  "console.paste.fill": "Fill",
  "console.paste.done.one": "{count} channel filled from channel {start}. Check, then save.",
  "console.paste.done.other": "{count} channels filled from channel {start}. Check, then save.",

  // The table
  "console.col.label": "Label",
  "console.col.source": "Source",
  "console.col.plugged": "Plugged in",
  "console.col.insert": "Insert",
  "console.col.direct": "Direct",
  "console.col.route": "Route",
  "console.col.aux": "Aux",
  "console.col.out": "Out →",
  "console.col.color": "Color",
  "console.col.note": "Note",

  "console.aria.label": "Label {n}",
  "console.aria.source": "Source {n}",
  "console.aria.direct": "Direct {n}",
  "console.aria.route": "Route {n}",
  "console.aria.aux": "Aux {n}",
  "console.aria.color": "Color {n}",
  "console.aria.note": "Note {n}",

  // The master section
  "console.master": "Master section",
  "console.section.groups": "Groups",
  "console.section.auxes": "Aux sends",
  "console.section.cue": "Cue",
  "console.section.mix": "Mix",
  "console.section.fx": "FX returns",
  "console.section.twoTrack": "2-Track",
  "console.section.monitors": "Monitors",
  "console.section.headphones": "Headphones",
  "console.section.midi": "MIDI",
  "console.section.power": "Power",
  "console.section.other": "Other",

  // The scribble strip to print
  "console.strip.title": "Scribble strip · {name}",
  "console.strip.subtitle.one":
    "{count} piece. Print at 100 %, cut, tape under the faders. Measure your channel spacing (GS3: about 30 mm).",
  "console.strip.subtitle.other":
    "{count} pieces. Print at 100 %, cut, tape under the faders. Measure your channel spacing (GS3: about 30 mm).",
  "console.strip.pitch": "Channel spacing (mm)",
  "console.strip.height": "Strip height (mm)",
  "console.strip.update": "Update",
  "console.strip.range": "{code} · channels {from}–{to}",
  "console.strip.direct": "DIR",
  "console.strip.aux": "AUX {list}",
} as const;
