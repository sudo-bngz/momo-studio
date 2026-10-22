/** Signing in, the activity trail, an entry's history and accounts. */
export const ops = {
  "ops.meta.activity": "Activity",
  "ops.meta.history": "History",
  "ops.meta.people": "Accounts",
  "ops.meta.login": "Sign in",

  // ---- What a revision points at: the kind of entry, the kind of change, the kind of actor ----

  "ops.type.devices": "Asset",
  "ops.type.cables": "Cable",
  "ops.type.bookings": "Booking",
  "ops.type.clients": "Client",
  "ops.type.rooms": "Room",
  "ops.type.locations": "Location",
  "ops.type.maintenance": "Maintenance",

  "ops.action.create": "Created",
  "ops.action.update": "Changed",
  "ops.action.publish": "Published",
  "ops.action.unpublish": "Unpublished",
  "ops.action.delete": "Deleted",
  "ops.action.restore": "Restored",
  "ops.action.baseline": "Before history",

  "ops.actor.user": "person",
  "ops.actor.token": "API token",
  "ops.actor.agent": "agent",
  "ops.actor.system": "system",

  // ---- The trail ----

  "ops.activity.title": "Activity",
  "ops.activity.subtitle": "Every change to the studio's content: who, what and when. Recorded by GoHead as each change is made.",
  "ops.activity.recentlyDeleted": "Recently deleted",

  "ops.feed.forbidden.lead":
    "Your account may not read the history. GoHead keeps it for roles that can change content: ask an admin for the role",
  "ops.feed.forbidden.tail": ", or sign in as an admin.",

  "ops.filter.who": "Who (a username, a token or an agent)…",
  "ops.filter.allTypes": "Everything",
  "ops.filter.anyChange": "Any change",
  "ops.filter.anyone": "Anyone",
  "ops.filter.actor.user": "People",
  "ops.filter.actor.token": "API tokens",
  "ops.filter.actor.agent": "Agents",
  "ops.filter.actor.system": "The system",

  "ops.deleted.lead": "Everything that was deleted.",
  "ops.deleted.tail": "puts the entry back under its own id, with the content it had.",

  "ops.col.when": "When",
  "ops.col.who": "Who",
  "ops.col.what": "What",
  "ops.col.entry": "Entry",
  "ops.col.version": "Version",
  "ops.col.field": "Field",
  "ops.col.before": "Before",
  "ops.col.after": "After",
  "ops.col.now": "Now",
  "ops.col.thisVersion": "This version",
  "ops.col.account": "Account",
  "ops.col.email": "Email",
  "ops.col.role": "Role",
  "ops.col.changes": "Changes",

  "ops.feed.empty": "No change recorded yet.",
  "ops.feed.emptyDeleted": "Nothing has been deleted.",

  "ops.page.newer": "← Newer",
  "ops.page.older": "Older →",
  "ops.page.position": "Page {page} of {pages}",
  "ops.page.changes.one": "{count} change",
  "ops.page.changes.other": "{count} changes",

  // ---- One entry's history ----

  "ops.history.link": "History",
  "ops.history.subtitle": "{type} · history",
  "ops.history.allActivity": "All activity",
  "ops.history.openIt": "Open it",
  "ops.history.forbidden": "Your account may not read the history.",
  "ops.history.empty": "No history for this entry.",

  "ops.versions.one": "{count} version",
  "ops.versions.other": "{count} versions",
  "ops.version.title": "Version {version}",
  "ops.version.pick": "Pick a version",
  "ops.version.pickLeft": "Pick a version on the left.",

  "ops.compare.previous": "vs previous",
  "ops.compare.now": "vs now",
  "ops.diff.sameAsNow": "This version matches the content as it stands.",
  "ops.diff.noChange": "Nothing changed in this version's fields.",
  "ops.items.one": "{count} item",
  "ops.items.other": "{count} items",

  "ops.restore.bringBack": "Bring it back",
  "ops.restore.thisVersion": "Restore this version",
  "ops.restore.version": "Restore version {version}",
  "ops.restore.pending": "Restoring…",
  "ops.restore.confirmUndelete": "Bring {name} back as it was at version {version}?",
  "ops.restore.confirmApply": "Make version {version} the current content of {name}?",
  "ops.restore.note": "A restore is itself recorded, so it can be undone. Fields the content model no longer has are left out.",

  // ---- Accounts ----

  "ops.people.title": "Accounts",
  "ops.people.subtitle": "Everyone signs in with their own account, so the activity trail says who did what.",
  "ops.people.subtitleShort": "Who can sign in to the studio.",
  "ops.people.onlyAdmin": "Only an administrator manages accounts. You are signed in as",
  "ops.people.withRole": "with the role",
  "ops.people.adminCanAdd":
    "An admin can add you, or create an account for someone else here, in GoHead's own admin, or with",
  "ops.people.add": "Add someone",
  "ops.people.new": "New account",
  "ops.people.editOne": "Edit {name}",
  "ops.people.create": "Create the account",
  "ops.people.passwordOnce": "The password is shown here once: copy it and give it to them. They can change it in GoHead's admin.",
  "ops.people.deleteOne": "Delete {name}",
  "ops.people.deleteConfirm": "Delete the account {name}? What they changed stays in the activity trail.",
  "ops.people.you": "you",
  "ops.people.whatTheyChanged": "What they changed →",
  "ops.people.empty": "No account yet.",
  "ops.people.footer":
    "Accounts are GoHead users: the same ones that open GoHead's admin. Roles decide what each may change, and the app acts as the signed-in person for every read and write — which is what makes the activity trail trustworthy.",

  "ops.field.username": "Username",
  "ops.field.username.hint": "What they type to sign in",
  "ops.field.email": "Email",
  "ops.field.role": "Role",
  "ops.field.role.hint": "Their changes are recorded under their name",
  "ops.field.password": "Password",
  "ops.field.newPassword": "New password",
  "ops.field.password.hint": "12 characters or more",
  "ops.field.password.keep": "Leave empty to keep it",

  "ops.roleNote.admin": "Everything, including accounts, the content model and this page",
  "ops.roleNote.editor": "Every kind of content, and the media library",
  "ops.roleNote.viewer": "Reads content, changes nothing — too little for this app",
  "ops.roleNote.studioStaff": "The studio's content: assets, cables, bookings, clients",

  // ---- Signing in ----

  "ops.login.tagline": "Assets · cables · bookings",
  "ops.login.expired": "Your session has expired: sign in again.",
  "ops.login.submit": "Sign in",
  "ops.login.username": "GoHead username",
  "ops.login.note": "Use your GoHead account. Admins manage accounts in the GoHead admin.",

  // ---- When a page breaks ----

  "ops.error.title": "Something went wrong",
  "ops.error.unreachable": "GoHead isn't answering. Is it running, and is GOHEAD_URL right?",
  "ops.error.unknownType": "GoHead doesn't know this content type: run npm run gohead:push.",
  "ops.error.logged": "The error was logged on the server.",
  "ops.error.retry": "Try again",
} as const;
