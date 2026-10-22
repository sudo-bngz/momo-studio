import type { vocab as en } from "../en/vocab";

/**
 * Studio French, not dictionary French: a patchbay is a baie de brassage, a
 * normalled column is normalisée, and a tentative booking is an option —
 * which is what a studio actually calls a hold.
 */
export const vocab: Record<keyof typeof en, string> = {
  // Signaux
  "signal.audio": "Audio",
  "signal.midi": "MIDI",
  "signal.cv": "CV",
  "signal.gate": "Gate / trig",
  "signal.clock": "Horloge / sync",
  "signal.digital_audio": "Audio numérique",
  "signal.usb": "USB",
  "signal.network": "Réseau",
  "signal.power": "Alimentation",
  "signal.control": "Contrôle / pédale",
  "signal.other": "Autre",

  // Connecteurs
  "connector.jack_ts": "Jack 6,35 mm TS",
  "connector.jack_trs": "Jack 6,35 mm TRS",
  "connector.minijack": "Mini-jack 3,5 mm",
  "connector.xlr": "XLR",
  "connector.rca": "RCA",
  "connector.din5": "DIN MIDI",
  "connector.usb_a": "USB-A",
  "connector.usb_b": "USB-B",
  "connector.usb_c": "USB-C",
  "connector.adat": "ADAT / Toslink",
  "connector.spdif_coax": "S/PDIF coax",
  "connector.bnc": "BNC",
  "connector.ethernet": "Ethernet",
  "connector.iec": "IEC (secteur)",
  "connector.dc": "DC",
  "connector.banana": "Banane",
  "connector.speakon": "Speakon",
  "connector.db25": "DB25",
  "connector.other": "Autre",

  // Sens du point
  "direction.in": "Entrée",
  "direction.out": "Sortie",
  "direction.io": "Entrée/Sortie",

  // Catégories
  "category.synth": "Synthé",
  "category.expander": "Expandeur / module",
  "category.drum_machine": "Boîte à rythmes",
  "category.sampler": "Sampleur / groovebox",
  "category.sequencer": "Séquenceur",
  "category.eurorack": "Eurorack",
  "category.effect": "Effet",
  "category.dynamics_eq": "Compresseur / EQ",
  "category.preamp": "Préampli",
  "category.audio_interface": "Interface audio",
  "category.mixer": "Console",
  "category.patchbay": "Baie de brassage",
  "category.monitor": "Enceinte",
  "category.headphones": "Casque",
  "category.microphone": "Micro",
  "category.controller": "Contrôleur",
  "category.computer": "Ordinateur",
  "category.midi_interface": "Interface MIDI",
  "category.power": "Alimentation",
  "category.other": "Autre",

  // État d'une machine
  "deviceState.in_use": "En service",
  "deviceState.spare": "En réserve",
  "deviceState.in_repair": "En réparation",
  "deviceState.loaned": "Prêté",
  "deviceState.for_sale": "À vendre",
  "deviceState.sold": "Vendu",

  // État d'un câble
  "cableState.connected": "Branché",
  "cableState.spare": "En réserve",
  "cableState.broken": "Défectueux",

  // Types d'emplacement
  "locationKind.rack": "Rack",
  "locationKind.desk": "Table",
  "locationKind.shelf": "Étagère / pied",
  "locationKind.wall": "Mur",
  "locationKind.case": "Flight-case",
  "locationKind.storage": "Rangement",

  // Réservations
  "bookingState.tentative": "Option",
  "bookingState.confirmed": "Confirmée",
  "bookingState.completed": "Terminée",
  "bookingState.cancelled": "Annulée",

  "sessionType.recording": "Enregistrement",
  "sessionType.production": "Production",
  "sessionType.mixing": "Mixage",
  "sessionType.mastering": "Mastering",
  "sessionType.rehearsal": "Répétition",
  "sessionType.rental": "Location de matériel",
  "sessionType.other": "Autre",

  // Comment une paire de la baie relie ses deux points
  "patchMode.normal": "Normalisé",
  "patchMode.normal.short": "N",
  "patchMode.normal.help": "Le haut et le bas sont reliés. Brancher dans l'un ou l'autre des jacks avant coupe la liaison.",
  "patchMode.half_normal": "Semi-normalisé",
  "patchMode.half_normal.short": "H",
  "patchMode.half_normal.help": "Le haut et le bas sont reliés. Le jack avant du haut prend une copie ; seul celui du bas coupe la liaison.",
  "patchMode.thru": "Thru",
  "patchMode.thru.short": "T",
  "patchMode.thru.help": "Pas de liaison : chaque point arrière ne rejoint que son propre jack avant. À brancher au cordon.",
};
