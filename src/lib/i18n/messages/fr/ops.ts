import type { ops as en } from "../en/ops";

export const ops: Record<keyof typeof en, string> = {
  "ops.meta.activity": "Journal d'activité",
  "ops.meta.history": "Historique",
  "ops.meta.people": "Comptes",
  "ops.meta.login": "Connexion",

  // ---- Ce que pointe une révision : le type d'entrée, le type de modification, le type d'auteur ----

  "ops.type.devices": "Machine",
  "ops.type.cables": "Câble",
  "ops.type.bookings": "Réservation",
  "ops.type.clients": "Client",
  "ops.type.rooms": "Salle",
  "ops.type.locations": "Emplacement",
  "ops.type.maintenance": "Maintenance",

  "ops.action.create": "Créé",
  "ops.action.update": "Modifié",
  "ops.action.publish": "Publié",
  "ops.action.unpublish": "Dépublié",
  "ops.action.delete": "Supprimé",
  "ops.action.restore": "Restauré",
  "ops.action.baseline": "Avant le journal",

  "ops.actor.user": "personne",
  "ops.actor.token": "jeton d'API",
  "ops.actor.agent": "agent",
  "ops.actor.system": "système",

  // ---- Le journal ----

  "ops.activity.title": "Journal d'activité",
  "ops.activity.subtitle":
    "Chaque modification du contenu du studio : qui, quoi et quand. Enregistré par GoHead au moment où la modification est faite.",
  "ops.activity.recentlyDeleted": "Supprimés récemment",

  "ops.feed.forbidden.lead":
    "Ton compte n'a pas le droit de lire l'historique. GoHead le réserve aux rôles qui peuvent modifier le contenu : demande à un administrateur le rôle",
  "ops.feed.forbidden.tail": ", ou connecte-toi avec un compte administrateur.",

  "ops.filter.who": "Qui (un nom de compte, un jeton ou un agent)…",
  "ops.filter.allTypes": "Tout",
  "ops.filter.anyChange": "Toute modification",
  "ops.filter.anyone": "N'importe qui",
  "ops.filter.actor.user": "Personnes",
  "ops.filter.actor.token": "Jetons d'API",
  "ops.filter.actor.agent": "Agents",
  "ops.filter.actor.system": "Le système",

  "ops.deleted.lead": "Tout ce qui a été supprimé.",
  "ops.deleted.tail": "remet l'entrée en place sous son propre identifiant, avec le contenu qu'elle avait.",

  "ops.col.when": "Quand",
  "ops.col.who": "Qui",
  "ops.col.what": "Quoi",
  "ops.col.entry": "Entrée",
  "ops.col.version": "Version",
  "ops.col.field": "Champ",
  "ops.col.before": "Avant",
  "ops.col.after": "Après",
  "ops.col.now": "Maintenant",
  "ops.col.thisVersion": "Cette version",
  "ops.col.account": "Compte",
  "ops.col.email": "E-mail",
  "ops.col.role": "Rôle",
  "ops.col.changes": "Modifications",

  "ops.feed.empty": "Aucune modification enregistrée pour l'instant.",
  "ops.feed.emptyDeleted": "Rien n'a été supprimé.",

  "ops.page.newer": "← Plus récent",
  "ops.page.older": "Plus ancien →",
  "ops.page.position": "Page {page} sur {pages}",
  "ops.page.changes.one": "{count} modification",
  "ops.page.changes.other": "{count} modifications",

  // ---- L'historique d'une entrée ----

  "ops.history.link": "Historique",
  "ops.history.subtitle": "{type} · historique",
  "ops.history.allActivity": "Tout le journal",
  "ops.history.openIt": "Ouvrir la fiche",
  "ops.history.forbidden": "Ton compte n'a pas le droit de lire l'historique.",
  "ops.history.empty": "Aucun historique pour cette entrée.",

  "ops.versions.one": "{count} version",
  "ops.versions.other": "{count} versions",
  "ops.version.title": "Version {version}",
  "ops.version.pick": "Choisis une version",
  "ops.version.pickLeft": "Choisis une version dans la liste de gauche.",

  "ops.compare.previous": "par rapport à la version précédente",
  "ops.compare.now": "par rapport à maintenant",
  "ops.diff.sameAsNow": "Cette version correspond au contenu actuel.",
  "ops.diff.noChange": "Aucun champ n'a changé dans cette version.",
  "ops.items.one": "{count} élément",
  "ops.items.other": "{count} éléments",

  "ops.restore.bringBack": "Restaurer",
  "ops.restore.thisVersion": "Restaurer cette version",
  "ops.restore.version": "Restaurer la version {version}",
  "ops.restore.pending": "Restauration…",
  "ops.restore.confirmUndelete": "Restaurer {name} tel quel, dans l'état de la version {version} ?",
  "ops.restore.confirmApply": "Faire de la version {version} le contenu actuel de {name} ?",
  "ops.restore.note":
    "Une restauration est elle-même enregistrée : tu peux donc l'annuler. Les champs que le modèle de contenu n'a plus sont laissés de côté.",

  // ---- Les comptes ----

  "ops.people.title": "Comptes",
  "ops.people.subtitle": "Chacun se connecte avec son propre compte : comme ça le journal d'activité dit qui a fait quoi.",
  "ops.people.subtitleShort": "Qui peut se connecter au studio.",
  "ops.people.onlyAdmin": "Seul un administrateur gère les comptes. Tu es connecté en tant que",
  "ops.people.withRole": "avec le rôle",
  "ops.people.adminCanAdd":
    "Un administrateur peut t'ajouter, ou créer un compte pour quelqu'un d'autre ici, dans l'admin de GoHead, ou avec",
  "ops.people.add": "Ajouter quelqu'un",
  "ops.people.new": "Nouveau compte",
  "ops.people.editOne": "Modifier {name}",
  "ops.people.create": "Créer le compte",
  "ops.people.passwordOnce":
    "Le mot de passe n'est affiché qu'une fois : copie-le et donne-le à la personne. Elle pourra le changer dans l'admin de GoHead.",
  "ops.people.deleteOne": "Supprimer {name}",
  "ops.people.deleteConfirm": "Supprimer le compte {name} ? Ce qu'il ou elle a modifié reste dans le journal d'activité.",
  "ops.people.you": "toi",
  "ops.people.whatTheyChanged": "Ce qu'il ou elle a modifié →",
  "ops.people.empty": "Aucun compte pour l'instant.",
  "ops.people.footer":
    "Les comptes sont des utilisateurs GoHead : les mêmes que ceux qui ouvrent l'admin de GoHead. Les rôles décident de ce que chacun peut modifier, et l'app agit au nom de la personne connectée pour chaque lecture et chaque écriture — c'est ce qui rend le journal d'activité fiable.",

  "ops.field.username": "Nom de compte",
  "ops.field.username.hint": "Ce qu'il ou elle tape pour se connecter",
  "ops.field.email": "E-mail",
  "ops.field.role": "Rôle",
  "ops.field.role.hint": "Ses modifications sont enregistrées sous son nom",
  "ops.field.password": "Mot de passe",
  "ops.field.newPassword": "Nouveau mot de passe",
  "ops.field.password.hint": "12 caractères ou plus",
  "ops.field.password.keep": "Laisse vide pour le garder",

  "ops.roleNote.admin": "Tout, y compris les comptes, le modèle de contenu et cette page",
  "ops.roleNote.editor": "Tous les types de contenu, et la médiathèque",
  "ops.roleNote.viewer": "Lit le contenu, ne modifie rien — trop peu pour cette app",
  "ops.roleNote.studioStaff": "Le contenu du studio : matériel, câbles, réservations, clients",

  // ---- Se connecter ----

  "ops.login.tagline": "Matériel · câbles · réservations",
  "ops.login.expired": "Ta session a expiré : reconnecte-toi.",
  "ops.login.submit": "Se connecter",
  "ops.login.username": "Nom de compte GoHead",
  "ops.login.note": "Utilise ton compte GoHead. Les administrateurs gèrent les comptes dans l'admin de GoHead.",

  // ---- Quand une page casse ----

  "ops.error.title": "Quelque chose s'est mal passé",
  "ops.error.unreachable": "GoHead ne répond pas. Est-ce qu'il tourne, et est-ce que GOHEAD_URL est la bonne ?",
  "ops.error.unknownType": "GoHead ne connaît pas ce type de contenu : lance npm run gohead:push.",
  "ops.error.logged": "L'erreur a été enregistrée côté serveur.",
  "ops.error.retry": "Réessayer",
};
