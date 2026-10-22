/** The patchbays, their boards and their printed strips. */
export const patchbay = {
  "patchbay.loopWarning": "⚠ Feedback loop: risk of frying a pedal",

  // ---- Page titles ----
  "patchbay.meta.title": "Patchbays",
  "patchbay.meta.titleOne": "Patchbay",
  "patchbay.meta.titleStrip": "Patchbay strips",

  // ---- The list of patchbays ----
  "patchbay.title": "Patchbays",
  "patchbay.subtitle": "What's behind every point, how it's normalled, and where it goes in the DAW.",
  "patchbay.add": "Add a patchbay",
  "patchbay.columnsUsed.one": "{used}/{count} column used",
  "patchbay.columnsUsed.other": "{used}/{count} columns used",
  "patchbay.edit": "Edit →",
  "patchbay.noColumns": "No columns yet: open it to set its size.",
  "patchbay.none": "No patchbay yet. Add one as an asset with the category “Patchbay”, then lay out its columns here.",

  // ---- One patchbay ----
  "patchbay.points.one": "{count} point",
  "patchbay.points.other": "{count} points",
  "patchbay.printStrips": "Print strips",
  "patchbay.editDevice": "Edit device",

  // ---- The board, drawn like the hardware ----
  "patchbay.board.top": "Top",
  "patchbay.board.bottom": "Bottom",
  "patchbay.board.mode": "Mode",
  "patchbay.board.dawTrack": "DAW track {track}",
  "patchbay.board.point": "Point {number}",
  "patchbay.board.labelTitle": "Label: {text}",
  "patchbay.board.cablesOnPoint.one": "{count} cable on this point!",
  "patchbay.board.cablesOnPoint.other": "{count} cables on this point!",
  "patchbay.board.severalCables": "several cables",
  "patchbay.board.loopNote": "Red jacks are part of a feedback loop: see the warnings above.",
  "patchbay.board.modeTitle": "{label}: {help}",
  "patchbay.board.modeNotSet": "Mode not set",

  // ---- Editing the board ----
  "patchbay.missingPorts.one":
    "This patchbay is missing {count} rear port (“Top N” / “Bottom N”): cables can't plug into that point yet.",
  "patchbay.missingPorts.other":
    "This patchbay is missing {count} rear ports (“Top N” / “Bottom N”): cables can't plug into those points yet.",
  "patchbay.addPorts": "Add the rear ports",
  "patchbay.addingPorts": "Adding…",
  "patchbay.oneColumn": "One column",
  "patchbay.allColumns": "All columns · paste from a sheet",
  "patchbay.clickColumn": "Click a column to edit its labels, mode, DAW track and color, or to patch what's behind it.",
  "patchbay.save": "Save patchbay",

  // ---- Editing one column ----
  "patchbay.editor.column": "Column {n}",
  "patchbay.editor.frontPoints": "front points {a} and {b}",
  "patchbay.editor.topLabel": "Top point {n} · label",
  "patchbay.editor.bottomLabel": "Bottom point {n} · label",
  "patchbay.editor.namedByCable": "Named by its cable; type to label it anyway",
  "patchbay.editor.topPlaceholder": "e.g. MPC1000 out 2",
  "patchbay.editor.bottomPlaceholder": "e.g. Mixer input 3",
  "patchbay.editor.labelHint":
    "A cable plugged in the rear names the point; the label is used when there is none (or for a machine you haven't added).",
  "patchbay.editor.mode": "Mode",
  "patchbay.editor.modeNotSetYet": "Not set yet.",
  "patchbay.editor.dawTrack": "DAW track",
  "patchbay.editor.dawPlaceholder": "e.g. 5/6",
  "patchbay.editor.note": "Note",
  "patchbay.editor.color": "Color",
  "patchbay.editor.colorAuto": "Auto",
  "patchbay.editor.colorSwatch": "Color {color}",
  "patchbay.editor.colorCustom": "Custom color",
  "patchbay.editor.colorHint":
    "Auto colors a point by the signal of its cable. Use colors to group columns (drums, synths, FX).",
  "patchbay.editor.noPort": "No “{port}” port on this patchbay yet.",
  "patchbay.editor.nothingBehind": "Nothing plugged in the rear.",
  "patchbay.editor.patchRear": "Patch the rear →",

  // ---- Every column at once, pasted from a spreadsheet ----
  "patchbay.paste.title": "Paste from a sheet",
  "patchbay.paste.help":
    "Select a row of cells in Google Sheets or Excel (labels, modes, Ableton tracks…), copy, paste here. “FREE” cells are left empty; modes accept N, H, T or the full names.",
  "patchbay.paste.into": "Into",
  "patchbay.paste.topLabels": "Top labels",
  "patchbay.paste.bottomLabels": "Bottom labels",
  "patchbay.paste.modes": "Modes",
  "patchbay.paste.dawTracks": "DAW tracks",
  "patchbay.paste.notes": "Notes",
  "patchbay.paste.fromColumn": "From column",
  "patchbay.paste.cells": "Cells",
  "patchbay.paste.fill": "Fill",
  "patchbay.paste.filled.one": "{count} column filled from column {start}.",
  "patchbay.paste.filled.other": "{count} columns filled from column {start}.",
  "patchbay.paste.skipped.one": "{count} value past the last column ignored.",
  "patchbay.paste.skipped.other": "{count} values past the last column ignored.",
  "patchbay.paste.check": "Check, then save.",
  "patchbay.table.columns": "Columns",
  "patchbay.table.columnsHint": "24 for a 48-point 1U patchbay; 16 or 32 for others.",
  "patchbay.table.setEveryMode": "Set every mode:",
  "patchbay.table.head.topLabel": "Top label",
  "patchbay.table.head.behindTop": "Behind the top",
  "patchbay.table.head.mode": "Mode",
  "patchbay.table.head.bottomLabel": "Bottom label",
  "patchbay.table.head.behindBottom": "Behind the bottom",
  "patchbay.table.head.daw": "DAW",
  "patchbay.table.head.color": "Color",
  "patchbay.table.head.note": "Note",
  "patchbay.table.aria.topLabel": "Top label {n}",
  "patchbay.table.aria.mode": "Mode {n}",
  "patchbay.table.aria.bottomLabel": "Bottom label {n}",
  "patchbay.table.aria.dawTrack": "DAW track {n}",
  "patchbay.table.aria.color": "Color {n}",
  "patchbay.table.aria.note": "Note {n}",

  // ---- The printed designation strips ----
  "patchbay.strip.title": "Strips · {name}",
  "patchbay.strip.subtitle.one": "{count} piece per row. Print at 100 % scale, cut, slide above and below the jacks.",
  "patchbay.strip.subtitle.other": "{count} pieces per row. Print at 100 % scale, cut, slide above and below the jacks.",
  "patchbay.strip.pitch": "Jack spacing (mm)",
  "patchbay.strip.height": "Strip height (mm)",
  "patchbay.strip.update": "Update",
  "patchbay.row.top": "Top row",
  "patchbay.row.bottom": "Bottom row",
  // The same two rows, inside the small line printed above each piece.
  "patchbay.strip.row.top": "top row",
  "patchbay.strip.row.bottom": "bottom row",
} as const;
