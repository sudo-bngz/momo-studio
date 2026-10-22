/**
 * The labels of the content model's options. The keys after the dot are the
 * enum options of gohead/model.json; vocab.ts keeps the tones and colours,
 * these keep the words.
 */
export const vocab = {
  // Signals
  "signal.audio": "Audio",
  "signal.midi": "MIDI",
  "signal.cv": "CV",
  "signal.gate": "Gate / trig",
  "signal.clock": "Clock / sync",
  "signal.digital_audio": "Digital audio",
  "signal.usb": "USB",
  "signal.network": "Network",
  "signal.power": "Power",
  "signal.control": "Control / pedal",
  "signal.other": "Other",

  // Connectors
  "connector.jack_ts": "6.35 mm TS",
  "connector.jack_trs": "6.35 mm TRS",
  "connector.minijack": "3.5 mm",
  "connector.xlr": "XLR",
  "connector.rca": "RCA",
  "connector.din5": "MIDI DIN",
  "connector.usb_a": "USB-A",
  "connector.usb_b": "USB-B",
  "connector.usb_c": "USB-C",
  "connector.adat": "ADAT / Toslink",
  "connector.spdif_coax": "S/PDIF coax",
  "connector.bnc": "BNC",
  "connector.ethernet": "Ethernet",
  "connector.iec": "IEC",
  "connector.dc": "DC",
  "connector.banana": "Banana",
  "connector.speakon": "Speakon",
  "connector.db25": "DB25",
  "connector.other": "Other",

  // Port direction
  "direction.in": "In",
  "direction.out": "Out",
  "direction.io": "In/Out",

  // Categories
  "category.synth": "Synth",
  "category.expander": "Expander / module",
  "category.drum_machine": "Drum machine",
  "category.sampler": "Sampler / groovebox",
  "category.sequencer": "Sequencer",
  "category.eurorack": "Eurorack",
  "category.effect": "Effect",
  "category.dynamics_eq": "Compressor / EQ",
  "category.preamp": "Preamp",
  "category.audio_interface": "Audio interface",
  "category.mixer": "Mixer",
  "category.patchbay": "Patchbay",
  "category.monitor": "Monitor",
  "category.headphones": "Headphones",
  "category.microphone": "Microphone",
  "category.controller": "Controller",
  "category.computer": "Computer",
  "category.midi_interface": "MIDI interface",
  "category.power": "Power",
  "category.other": "Other",

  // What state a machine is in
  "deviceState.in_use": "In use",
  "deviceState.spare": "Spare",
  "deviceState.in_repair": "In repair",
  "deviceState.loaned": "Loaned",
  "deviceState.for_sale": "For sale",
  "deviceState.sold": "Sold",

  // What state a cable is in
  "cableState.connected": "Connected",
  "cableState.spare": "Spare",
  "cableState.broken": "Broken",

  // Kinds of place
  "locationKind.rack": "Rack",
  "locationKind.desk": "Desk",
  "locationKind.shelf": "Shelf / stand",
  "locationKind.wall": "Wall",
  "locationKind.case": "Case",
  "locationKind.storage": "Storage",

  // Bookings
  "bookingState.tentative": "Tentative",
  "bookingState.confirmed": "Confirmed",
  "bookingState.completed": "Completed",
  "bookingState.cancelled": "Cancelled",

  "sessionType.recording": "Recording",
  "sessionType.production": "Production",
  "sessionType.mixing": "Mixing",
  "sessionType.mastering": "Mastering",
  "sessionType.rehearsal": "Rehearsal",
  "sessionType.rental": "Gear rental",
  "sessionType.other": "Other",

  // How a patchbay column joins its two points
  "patchMode.normal": "Normal",
  "patchMode.normal.short": "N",
  "patchMode.normal.help": "Top and bottom are connected. Plugging into either front jack breaks the link.",
  "patchMode.half_normal": "Half-normal",
  "patchMode.half_normal.short": "H",
  "patchMode.half_normal.help": "Top and bottom are connected. The top front jack takes a copy; only the bottom front jack breaks the link.",
  "patchMode.thru": "Thru",
  "patchMode.thru.short": "T",
  "patchMode.thru.help": "Not connected: each rear point only reaches its own front jack. Patch with a cord.",
} as const;
