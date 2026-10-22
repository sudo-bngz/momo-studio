import type { patchbay as en } from "../en/patchbay";

/**
 * Le français du studio : une paire de la baie, ses deux points, le haut et le
 * bas, et ce qu'on colle depuis un tableur.
 */
export const patchbay: Record<keyof typeof en, string> = {
  "patchbay.loopWarning": "⚠ Boucle de retour : risque de griller une pédale",

  // ---- Titres de page ----
  "patchbay.meta.title": "Baies de brassage",
  "patchbay.meta.titleOne": "Baie de brassage",
  "patchbay.meta.titleStrip": "Bandeaux de baie",

  // ---- La liste des baies ----
  "patchbay.title": "Baies de brassage",
  "patchbay.subtitle": "Ce qu'il y a derrière chaque point, comment c'est normalisé, et où ça arrive dans le DAW.",
  "patchbay.add": "Ajouter une baie",
  "patchbay.columnsUsed.one": "{used}/{count} paire utilisée",
  "patchbay.columnsUsed.other": "{used}/{count} paires utilisées",
  "patchbay.edit": "Modifier →",
  "patchbay.noColumns": "Aucune paire pour l'instant : ouvre-la pour définir sa taille.",
  "patchbay.none":
    "Aucune baie de brassage. Ajoute-la comme matériel avec la catégorie « Baie de brassage », puis organise ses paires ici.",

  // ---- Une baie ----
  "patchbay.points.one": "{count} point",
  "patchbay.points.other": "{count} points",
  "patchbay.printStrips": "Imprimer les bandeaux",
  "patchbay.editDevice": "Modifier la machine",

  // ---- La baie dessinée comme le matériel ----
  "patchbay.board.top": "Haut",
  "patchbay.board.bottom": "Bas",
  "patchbay.board.mode": "Mode",
  "patchbay.board.dawTrack": "Piste DAW {track}",
  "patchbay.board.point": "Point {number}",
  "patchbay.board.labelTitle": "Étiquette : {text}",
  "patchbay.board.cablesOnPoint.one": "{count} câble sur ce point !",
  "patchbay.board.cablesOnPoint.other": "{count} câbles sur ce point !",
  "patchbay.board.severalCables": "plusieurs câbles",
  "patchbay.board.loopNote": "Les jacks en rouge font partie d'une boucle de retour : voir les avertissements ci-dessus.",
  "patchbay.board.modeTitle": "{label} : {help}",
  "patchbay.board.modeNotSet": "Mode non défini",

  // ---- Modifier la baie ----
  "patchbay.missingPorts.one":
    "Il manque {count} point arrière à cette baie (« Top N » / « Bottom N ») : aucun câble ne peut encore s'y brancher.",
  "patchbay.missingPorts.other":
    "Il manque {count} points arrière à cette baie (« Top N » / « Bottom N ») : aucun câble ne peut encore se brancher sur ces points.",
  "patchbay.addPorts": "Ajouter les points arrière",
  "patchbay.addingPorts": "Ajout…",
  "patchbay.oneColumn": "Une paire",
  "patchbay.allColumns": "Toutes les paires · coller depuis un tableur",
  "patchbay.clickColumn":
    "Clique sur une paire pour modifier ses étiquettes, son mode, sa piste DAW et sa couleur, ou pour brancher ce qu'il y a derrière.",
  "patchbay.save": "Enregistrer la baie",

  // ---- Modifier une paire ----
  "patchbay.editor.column": "Paire {n}",
  "patchbay.editor.frontPoints": "points avant {a} et {b}",
  "patchbay.editor.topLabel": "Point du haut {n} · étiquette",
  "patchbay.editor.bottomLabel": "Point du bas {n} · étiquette",
  "patchbay.editor.namedByCable": "Nommé par son câble ; tape quand même une étiquette si tu veux",
  "patchbay.editor.topPlaceholder": "ex. MPC1000 out 2",
  "patchbay.editor.bottomPlaceholder": "ex. entrée 3 de la console",
  "patchbay.editor.labelHint":
    "Un câble branché à l'arrière nomme le point ; l'étiquette sert quand il n'y en a pas (ou pour une machine que tu n'as pas encore ajoutée).",
  "patchbay.editor.mode": "Mode",
  "patchbay.editor.modeNotSetYet": "Pas encore défini.",
  "patchbay.editor.dawTrack": "Piste DAW",
  "patchbay.editor.dawPlaceholder": "ex. 5/6",
  "patchbay.editor.note": "Note",
  "patchbay.editor.color": "Couleur",
  "patchbay.editor.colorAuto": "Auto",
  "patchbay.editor.colorSwatch": "Couleur {color}",
  "patchbay.editor.colorCustom": "Couleur personnalisée",
  "patchbay.editor.colorHint":
    "Auto colore un point selon le signal de son câble. Utilise les couleurs pour grouper les paires (batterie, synthés, FX).",
  "patchbay.editor.noPort": "Pas encore de point « {port} » sur cette baie.",
  "patchbay.editor.nothingBehind": "Rien de branché à l'arrière.",
  "patchbay.editor.patchRear": "Brancher l'arrière →",

  // ---- Toutes les paires d'un coup, collées depuis un tableur ----
  "patchbay.paste.title": "Coller depuis un tableur",
  "patchbay.paste.help":
    "Sélectionne une ligne de cellules dans Google Sheets ou Excel (étiquettes, modes, pistes Ableton…), copie, colle ici. Les cellules « FREE » ou « LIBRE » sont laissées vides ; les modes acceptent N, H, T ou les noms complets.",
  "patchbay.paste.into": "Vers",
  "patchbay.paste.topLabels": "Étiquettes du haut",
  "patchbay.paste.bottomLabels": "Étiquettes du bas",
  "patchbay.paste.modes": "Modes",
  "patchbay.paste.dawTracks": "Pistes DAW",
  "patchbay.paste.notes": "Notes",
  "patchbay.paste.fromColumn": "À partir de la paire",
  "patchbay.paste.cells": "Cellules",
  "patchbay.paste.fill": "Remplir",
  "patchbay.paste.filled.one": "{count} paire remplie à partir de la paire {start}.",
  "patchbay.paste.filled.other": "{count} paires remplies à partir de la paire {start}.",
  "patchbay.paste.skipped.one": "{count} valeur au-delà de la dernière paire ignorée.",
  "patchbay.paste.skipped.other": "{count} valeurs au-delà de la dernière paire ignorées.",
  "patchbay.paste.check": "Vérifie, puis enregistre.",
  "patchbay.table.columns": "Paires",
  "patchbay.table.columnsHint": "24 pour une baie 1U de 48 points ; 16 ou 32 pour les autres.",
  "patchbay.table.setEveryMode": "Mettre tous les modes :",
  "patchbay.table.head.topLabel": "Étiquette du haut",
  "patchbay.table.head.behindTop": "Derrière le haut",
  "patchbay.table.head.mode": "Mode",
  "patchbay.table.head.bottomLabel": "Étiquette du bas",
  "patchbay.table.head.behindBottom": "Derrière le bas",
  "patchbay.table.head.daw": "DAW",
  "patchbay.table.head.color": "Couleur",
  "patchbay.table.head.note": "Note",
  "patchbay.table.aria.topLabel": "Étiquette du haut {n}",
  "patchbay.table.aria.mode": "Mode {n}",
  "patchbay.table.aria.bottomLabel": "Étiquette du bas {n}",
  "patchbay.table.aria.dawTrack": "Piste DAW {n}",
  "patchbay.table.aria.color": "Couleur {n}",
  "patchbay.table.aria.note": "Note {n}",

  // ---- Les bandeaux à imprimer ----
  "patchbay.strip.title": "Bandeaux · {name}",
  "patchbay.strip.subtitle.one":
    "{count} morceau par rangée. Imprime au pas réel (échelle 100 %), découpe, glisse au-dessus et en dessous des jacks.",
  "patchbay.strip.subtitle.other":
    "{count} morceaux par rangée. Imprime au pas réel (échelle 100 %), découpe, glisse au-dessus et en dessous des jacks.",
  "patchbay.strip.pitch": "Pas des jacks (mm)",
  "patchbay.strip.height": "Hauteur du bandeau (mm)",
  "patchbay.strip.update": "Mettre à jour",
  "patchbay.row.top": "Rangée du haut",
  "patchbay.row.bottom": "Rangée du bas",
  // Les deux mêmes rangées, dans la petite ligne imprimée au-dessus de chaque morceau.
  "patchbay.strip.row.top": "rangée du haut",
  "patchbay.strip.row.bottom": "rangée du bas",
};
