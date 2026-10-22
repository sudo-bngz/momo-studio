import type { bookings as en } from "../en/bookings";

/**
 * Le français du studio : une réservation « tentative » est une option, et on
 * se tutoie — comme dans la version anglaise, directe et personnelle.
 */
export const bookings: Record<keyof typeof en, string> = {
  // Le calendrier de la semaine
  "bookings.meta.title": "Réservations",
  "bookings.title": "Réservations",
  "bookings.weekOf": "Semaine du {day}",
  "bookings.sessions.one": "{count} session",
  "bookings.sessions.other": "{count} sessions",
  "bookings.thisWeek": "Cette semaine",
  "bookings.calendarFeed": "Flux calendrier",
  "bookings.new": "Nouvelle réservation",
  "bookings.allRooms": "Toutes les salles",
  "bookings.bookThisDay": "Réserver ce jour",
  "bookings.withEngineer": "avec {name}",
  "bookings.paid": "payé",
  "bookings.emptyWeek": "Rien de réservé cette semaine.",

  // Une réservation
  "bookings.meta.detail": "Réservation",
  "bookings.meta.new": "Nouvelle réservation",
  "bookings.delete.hint": "Session tombée à l'eau ? Passe-la en « Annulée » pour garder une trace.",
  "bookings.delete.label": "Supprimer la réservation",
  "bookings.delete.confirm": "Supprimer « {title} » ?",

  // Le formulaire
  "bookings.form.session": "Session",
  "bookings.form.title": "Intitulé",
  "bookings.form.titlePlaceholder": "Artiste – enregistrement EP",
  "bookings.form.starts": "Début",
  "bookings.form.ends": "Fin",
  "bookings.form.room": "Salle",
  "bookings.form.roomRate": "{room} : {rates}",
  "bookings.form.perHour": "{price}/h",
  "bookings.form.perDay": "{price}/jour",
  "bookings.form.client": "Client",
  "bookings.form.type": "Type",
  "bookings.form.engineer": "Ingé son",
  "bookings.notes": "Notes",
  "bookings.form.notesHint": "À préparer : patch, micros, fichiers à charger…",
  "bookings.form.statusPrice": "Statut et tarif",
  "bookings.form.state": "État",
  "bookings.form.price": "Tarif",
  "bookings.form.paid": "Payé",
  "bookings.form.allowOverlap": "Réserver quand même si la salle ou une machine est déjà prise",
  "bookings.form.assets": "Matériel à réserver",
  "bookings.form.assetsHint":
    "Les machines dont la session a besoin. Une machine réservée par deux sessions qui se chevauchent est refusée, sauf si tu réserves quand même.",
  "bookings.form.save": "Enregistrer la réservation",
  "bookings.form.book": "Réserver",

  // Clients
  "bookings.clients.meta.title": "Clients",
  "bookings.clients.title": "Clients",
  "bookings.clients.subtitle": "Les artistes et les gens qui réservent le studio.",
  "bookings.clients.add": "Ajouter un client",
  "bookings.clients.addOne": "Ajouter un client",
  "bookings.clients.new": "Nouveau client",
  "bookings.clients.edit": "Modifier {name}",
  "bookings.clients.name": "Nom",
  "bookings.clients.artistName": "Nom d'artiste",
  "bookings.clients.email": "E-mail",
  "bookings.clients.phone": "Téléphone",
  "bookings.clients.delete": "Supprimer le client",
  "bookings.clients.deleteConfirm": "Supprimer {name} ? Ses réservations restent, sans client.",
  "bookings.clients.col.client": "Client",
  "bookings.clients.col.contact": "Contact",
  "bookings.clients.col.sessions": "Sessions",
  "bookings.clients.col.billed": "Facturé",
  "bookings.clients.col.unpaid": "Impayé",
  "bookings.clients.empty": "Aucun client pour l'instant.",
};
