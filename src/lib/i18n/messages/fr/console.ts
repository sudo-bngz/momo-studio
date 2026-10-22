import type { console as en } from "../en/console";

export const console: Record<keyof typeof en, string> = {
  "console.meta.list": "Consoles",
  "console.meta.detail": "Console",
  "console.meta.strip": "Bandeau",

  // La liste des consoles
  "console.list.title": "Consoles",
  "console.list.subtitle": "Toutes les voies de la console : ce qui est branché, comment ça s'appelle, où ça part.",
  "console.list.add": "Ajouter une console",
  "console.list.edit": "Modifier →",
  "console.list.empty":
    "Aucune console pour l'instant. Ajoute-la comme matériel dans la catégorie « {category} » et remplis ses points depuis un modèle (l'Allen & Heath GS3 y est), ou nomme ses points « Ch 1 Line », « Ch 1 Insert »…",

  // Ce qu'il y a sur la console, compté
  "console.shape.channels.one": "{count} voie",
  "console.shape.channels.other": "{count} voies",
  "console.shape.groups.one": "{count} sous-groupe",
  "console.shape.groups.other": "{count} sous-groupes",
  "console.shape.auxes.one": "{count} aux",
  "console.shape.auxes.other": "{count} aux",
  "console.shape.inUse.one": "{count} utilisée",
  "console.shape.inUse.other": "{count} utilisées",
  "console.shape.badge": "{ch} voies · {grp} grp · {aux} aux",
  "console.shape.fromPorts": "(d'après les points)",

  // Une console
  "console.printScribble": "Imprimer le bandeau",
  "console.editDevice": "Modifier la machine",

  // Les rôles des points d'une voie, dessinés dans une tranche de 71 px : rester court
  "console.role.mic": "Mic",
  "console.role.line": "Ligne",
  "console.role.tape": "Magnéto",
  // Dans une tranche de 71 px et sur le bandeau imprimé, « Magnéto » ne rentre pas
  "console.role.tapeShort": "Magn.",
  "console.role.insert": "Insert",
  "console.role.insertShort": "Ins",
  "console.role.out": "Sortie",

  // La console dessinée
  "console.socket.free": "{port} : libre",
  "console.insert.none": "Insert : rien",
  "console.legend.direct": "DIRECT",
  "console.legend.aux": "AUX {list}",
  "console.legend.mix": "→ MIX",
  "console.loopNote": "Les tranches en rouge font partie d'une boucle de retour d'aux : voir les avertissements ci-dessus.",
  "console.groupNote": "Console in-line : les sous-groupes sortent par les sorties de piste des voies g, g+{a}, g+{b}…",
  "console.why": "pourquoi →",

  "console.tab.one": "Une voie",
  "console.tab.all": "Toutes les voies · coller depuis un tableur",
  "console.pickChannel": "Clique sur une voie pour la nommer, choisir sa source, la router et voir ce qui y est branché.",
  "console.save": "Enregistrer la console",
  "console.channels": "Voies",
  "console.channel": "Voie {n}",

  // Régler une tranche
  "console.field.label": "Nom (bandeau)",
  "console.field.label.placeholder": "Kick, Prophet, Voix…",
  "console.field.source": "Source utilisée",
  "console.field.source.hint":
    "Laquelle des trois est en service, quand plusieurs sont câblées. Le retour magnéto, c'est la",
  "console.field.source.hintEnd": ".",
  "console.field.route": "Routage",
  "console.field.route.placeholder": "ex. 1-2 + mix, ou une note sur le routage",
  "console.field.aux": "Départs auxiliaires ouverts",
  "console.field.aux.hint": "Sert à repérer un aux qui revient dans une voie qui l'alimente.",
  "console.field.color": "Couleur",
  "console.field.note": "Note",

  "console.route.direct": "Sortie directe",
  "console.route.mix": "Mix L/R",
  "console.route.group": "Grp {g}",
  "console.route.hint.inline.a": "et les sous-groupes partagent la",
  "console.route.hint.inline.b":
    " de cette voie : un sous-groupe sort donc par les sorties de piste des voies sur lesquelles il est en parallèle.",
  "console.route.hint.split.a": "ne sort que cette voie ; un",
  "console.route.hint.split.b": "sort par sa propre sortie.",

  "console.term.monitorPath": "voie d'écoute",
  "console.term.directOut": "Sortie directe",
  "console.term.trackOut": "sortie de piste",
  "console.term.group": "sous-groupe",

  "console.aux.n": "Aux {n}",
  "console.color.none": "Aucune",
  "console.color.swatch": "Couleur {color}",

  "console.sockets": "Points de la voie {n}",
  "console.noPorts":
    "Aucun point « Ch {n} … » sur cette machine : ajoute-les (ou recharge un modèle) dans Modifier la machine.",
  "console.leavesBy": "Avec ce routage le signal sort par",
  "console.leavesBy.end": ".",
  "console.leavesBy.many":
    "Plusieurs points parce que le sous-groupe est en parallèle sur les sorties de piste de ces voies — le signal est là où tu as câblé.",

  // Toutes les tranches, collées depuis un tableur
  "console.paste.title": "Coller depuis un tableur",
  "console.paste.hint":
    "Copie une ligne de cellules (noms de voies, routages du type « 1-2 », « mix », « direct », numéros d'aux…) et colle-la ici.",
  "console.paste.into": "Dans",
  "console.paste.field.label": "Les noms",
  "console.paste.field.source": "Les sources (mic / ligne / magnéto)",
  "console.paste.field.route": "Le routage",
  "console.paste.field.aux": "Les départs aux",
  "console.paste.field.note": "Les notes",
  "console.paste.from": "À partir de la voie",
  "console.paste.cells": "Cellules",
  "console.paste.placeholder": "Kick\tSnare\tCharley\tProphet L\t…",
  "console.paste.fill": "Remplir",
  "console.paste.done.one": "{count} voie remplie à partir de la voie {start}. Vérifie, puis enregistre.",
  "console.paste.done.other": "{count} voies remplies à partir de la voie {start}. Vérifie, puis enregistre.",

  // Le tableau
  "console.col.label": "Nom",
  "console.col.source": "Source",
  "console.col.plugged": "Branché",
  "console.col.insert": "Insert",
  "console.col.direct": "Direct",
  "console.col.route": "Routage",
  "console.col.aux": "Aux",
  "console.col.out": "Sortie →",
  "console.col.color": "Couleur",
  "console.col.note": "Note",

  "console.aria.label": "Nom voie {n}",
  "console.aria.source": "Source voie {n}",
  "console.aria.direct": "Sortie directe voie {n}",
  "console.aria.route": "Routage voie {n}",
  "console.aria.aux": "Aux voie {n}",
  "console.aria.color": "Couleur voie {n}",
  "console.aria.note": "Note voie {n}",

  // La section master
  "console.master": "Section master",
  "console.section.groups": "Sous-groupes",
  "console.section.auxes": "Départs auxiliaires",
  "console.section.cue": "Cue",
  "console.section.mix": "Mix",
  "console.section.fx": "Retours d'effet",
  "console.section.twoTrack": "2-pistes",
  "console.section.monitors": "Écoutes",
  "console.section.headphones": "Casques",
  "console.section.midi": "MIDI",
  "console.section.power": "Alimentation",
  "console.section.other": "Divers",

  // Le bandeau à imprimer
  "console.strip.title": "Bandeau · {name}",
  "console.strip.subtitle.one":
    "{count} bande. Imprime à 100 %, découpe, scotche sous les faders. Mesure l'écartement de tes voies (GS3 : environ 30 mm).",
  "console.strip.subtitle.other":
    "{count} bandes. Imprime à 100 %, découpe, scotche sous les faders. Mesure l'écartement de tes voies (GS3 : environ 30 mm).",
  "console.strip.pitch": "Écartement des voies (mm)",
  "console.strip.height": "Hauteur du bandeau (mm)",
  "console.strip.update": "Mettre à jour",
  "console.strip.range": "{code} · voies {from}–{to}",
  "console.strip.direct": "DIR",
  "console.strip.aux": "AUX {list}",
};
