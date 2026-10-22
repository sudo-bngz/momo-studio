/**
 * Le manuel, en français.
 */
import type { HelpContent } from "./types";

export const fr: HelpContent = {
  topics: {
  // ---- L'idée ----
  model: {
    title: "Comment tout s'emboîte",
    lede: "Tout ici tient en trois choses : le matériel, les emplacements et les câbles. Toutes les autres pages ne sont que des façons de regarder ces trois-là.",
    points: [
      { term: "Matériel", text: "Une machine, avec ses points. Un point est une prise physique : un nom, un sens (entrée, sortie ou les deux), un signal et un connecteur. Les points, c'est le panneau arrière — ils changent quand tu recâbles la machine, pas d'une session à l'autre." },
      { term: "Emplacement", text: "Là où une machine est posée : un rack, une table, une étagère, un mur, un flight-case. Un emplacement appartient à une salle et porte une position et une taille en centimètres — c'est ce que dessine le plan du studio." },
      { term: "Câble", text: "Un cheminement entre deux points : d'une machine et d'un nom de point, vers une machine et un nom de point. C'est le câble que suit le plan de câblage, et c'est lui que vérifie la liste des anomalies." },
      { term: "Tout le reste", text: "Les baies de brassage, les consoles, le plan de câblage, le plan du studio et les étiquettes ne stockent aucune donnée propre. Ils lisent le même matériel et les mêmes câbles, et les montrent dans la forme où tu penses." },
    ],
    long: [
      "Comme un câble pointe un point par son nom, renommer un point qu'un câble utilise est refusé : le câble ne pointerait plus sur rien. Repointe d'abord l'extrémité du câble, ou supprime-le et rebranche.",
      "Deux types de matériel portent un peu plus. Une baie de brassage a des paires, et chaque paire peut être normalisée, semi-normalisée ou thru. Une console a des tranches : le nom, la source, le routage et les départs auxiliaires de chaque voie. Les deux existent pour que l'app puisse suivre un signal à travers la machine au lieu de s'arrêter devant.",
    ],
    see: ["assets", "cables", "plan"],
  },

  // ---- Vue d'ensemble ----
  overview: {
    title: "Vue d'ensemble",
    lede: "L'état du studio en un écran : ce qui est réservé, ce qui est branché, ce qui est cassé et ce qui demande de l'attention.",
    points: [
      { term: "Les chiffres", text: "Le matériel possédé, sa valeur totale, les câbles branchés, et ce que le plan a trouvé de travers. Chacun renvoie à la page d'où il vient." },
      { term: "À surveiller", text: "Les machines parties en réparation ou prêtées, les garanties qui arrivent à terme, et tout ce que le plan a trouvé de travers. Vide, ça veut dire que toutes les machines sont là et que le plan est cohérent." },
      { term: "Maintenance", text: "Les dernières interventions notées sur une machine — réparation, révision, calibration, changement de condensateurs — les plus récentes en premier." },
      { term: "14 prochains jours", text: "Toutes les sessions des deux semaines à venir, avec leur salle, leur client et les machines dont elles ont besoin." },
    ],
    see: ["plan", "bookings"],
  },

  // ---- Matériel ----
  assets: {
    title: "Matériel",
    lede: "Toutes les machines du studio — synthés, expandeurs, interfaces, pédales, la console, les baies de brassage, les ordinateurs — avec leurs points, leur emplacement et leurs photos.",
    points: [
      { term: "Galerie et tableau", text: "Le même matériel, soit en vignettes avec sa photo ou son dessin, soit en tableau que tu peux parcourir et trier. Les filtres restent quand tu passes de l'un à l'autre." },
      { term: "Code", text: "Le code court que tu écris sur la machine et sur les étiquettes de ses câbles. Garde-le court : il s'imprime en taille d'étiquette." },
      { term: "Dessin", text: "Une machine sans photo est dessinée d'après sa catégorie et sa taille, comme ça un rack de matériel non photographié se lit quand même d'un coup d'œil. Ajoute une photo et c'est la photo qui gagne." },
      { term: "État", text: "En service, en réserve, en réparation, prêtée, à vendre, vendue. Le matériel vendu est laissé de côté par le plan de câblage et le plan du studio ; tout le reste est dessiné." },
      { term: "Points", text: "Les prises de la machine. Tout ce qui vient après — le branchement, le plan, la vue console, les étiquettes de câbles — les lit : ça vaut le coup de les faire bien une fois pour toutes." },
    ],
    steps: [
      "Ajoute la machine, choisis sa catégorie et donne-lui un code.",
      "Remplis ses points depuis un modèle s'il y en a un pour elle, puis corrige ce qui diffère.",
      "Mets-la dans un emplacement pour qu'elle apparaisse dans le bon rack et sur le plan du studio.",
      "Dépose une photo ou deux — la première est la couverture.",
    ],
    see: ["asset-form", "racks", "cables"],
  },

  asset: {
    title: "Une machine",
    lede: "Tout sur une machine : ses photos, son emplacement, ses points et ce qui est branché sur chacun.",
    points: [
      { term: "Points", text: "Chaque prise avec son sens, son signal et son connecteur, et le câble qui y est branché s'il y en a un. Un point libre te propose de le brancher." },
      { term: "libre · brancher →", text: "Démarre un nouveau câble avec ce point déjà renseigné, comme ça tu n'as pas à retrouver la machine." },
      { term: "Voir dans le plan", text: "Ouvre le plan de câblage centré sur cette machine, avec ce qui l'alimente et ce qu'elle alimente." },
      { term: "Maintenance", text: "Les interventions notées sur cette machine, la plus récente en haut." },
    ],
    see: ["assets", "cables", "plan"],
  },

  "asset-form": {
    title: "Ajouter et modifier du matériel",
    lede: "L'identité de la machine, où elle vit, et ses points. Les points sont ce qui compte : tout le reste de l'app les lit.",
    points: [
      { term: "Remplir les points", text: "Choisis un modèle et les points sont écrits pour toi — l'Allen & Heath GS3 24/8/2 en remplit 163, correctement nommés. Ensuite corrige ce qui diffère sur ton exemplaire." },
      { term: "Nom du point", text: "Du texte libre, mais les noms portent du sens. « Ch 7 Line », « Ch 7 Insert », « Ch 7 Track Out » font la voie 7 d'une console. « Top 12 » et « Bottom 12 » font la paire 12 d'une baie de brassage. Le reste n'est qu'une prise." },
      { term: "Sens", text: "Entrée, Sortie ou Entrée/Sortie. Le plan s'en sert pour vérifier que tu n'as pas relié deux sorties, et pour savoir dans quel sens va le signal." },
      { term: "Signal", text: "Audio, MIDI, CV, gate, horloge, audio numérique, USB, réseau, alimentation, contrôle. Les incohérences entre un câble et le point où il arrive sont signalées, pas bloquées — il arrive vraiment qu'on envoie du CV dans un câble audio." },
      { term: "Photos", text: "Huit au maximum, redimensionnées dans le navigateur avant l'envoi pour qu'une photo de téléphone ne te coûte pas des mégaoctets. La première est la couverture ; fais glisser pour les réordonner." },
      { term: "Renommer un point branché", text: "Refusé tant qu'un câble l'utilise, parce que le câble garde le nom. Déplace d'abord le câble." },
    ],
    see: ["assets", "console"],
  },

  // ---- Les emplacements ----
  racks: {
    title: "Racks & emplacements",
    lede: "Chaque rack, table, étagère, mur et flight-case, avec ce qu'il y a dedans — de haut en bas, comme tu regarderais le rack lui-même.",
    points: [
      { term: "Unités de rack", text: "Un emplacement avec une hauteur en U dessine ses U, comme ça tu vois ce qui est libre avant d'acheter le prochain boîtier 1U. Les positions se comptent depuis le U1, en haut." },
      { term: "Salle", text: "Les emplacements appartiennent à une salle. Le plan du studio dessine une salle à la fois." },
      { term: "Position", text: "Le x et le y en centimètres, la taille et la rotation : c'est ce dont le plan du studio se sert. Un emplacement sans position est placé automatiquement." },
    ],
    see: ["places", "map", "assets"],
  },

  places: {
    title: "Salles & emplacements",
    lede: "Les salles, c'est ce que tu réserves ; les emplacements, c'est là où sont posées les machines. Les tailles sont en centimètres, mesurées comme tu veux du moment que tu restes cohérent.",
    points: [
      { term: "Taille de la salle", text: "Largeur et profondeur en cm. Le plan se met à l'échelle tout seul : une mesure approximative donne quand même un plan utilisable." },
      { term: "Position de l'emplacement", text: "Le x et le y en cm depuis le coin haut-gauche de la salle, plus une rotation en degrés pour tout ce qui est de biais." },
      { term: "Unités de rack", text: "Donne à un rack sa hauteur en U et la page des racks dessine ses U." },
      { term: "Couleur", text: "La couleur d'une salle teinte ses réservations dans le calendrier et son contour sur le plan." },
    ],
    see: ["racks", "map"],
  },

  map: {
    title: "Plan du studio",
    lede: "La salle vue de dessus : où est chaque emplacement, ce qu'il y a dedans, et les cheminements de câbles entre eux. Clique sur un emplacement pour zoomer dedans.",
    points: [
      { term: "Échelle", text: "Des centimètres réels. Un emplacement dessiné petit est vraiment petit — le zoom existe parce qu'un pedalboard de 50 cm ne peut pas porter dix étiquettes à l'échelle de la salle." },
      { term: "Faisceaux", text: "Les câbles entre les deux mêmes emplacements sont dessinés comme un seul cheminement, étiqueté avec le nombre de câbles qu'il porte. C'est là-dessus que tu te prends les pieds." },
      { term: "Zoomer dans un emplacement", text: "Dessine cet emplacement seul, en grand, avec tout le matériel qu'il contient et chaque câble qui entre ou sort, nommé." },
      { term: "Un emplacement sans position", text: "Il est placé automatiquement le long des murs de la salle. Renseigne son x et son y pour le fixer là où il est vraiment." },
    ],
    see: ["places", "plan"],
  },

  // ---- Les câbles ----
  cables: {
    title: "Câbles",
    lede: "Tous les cheminements du studio, et la liste de tout ce qui cloche dans le patch actuel.",
    points: [
      { term: "Code", text: "Ce que tu écris sur l'étiquette aux deux extrémités. Imprimable depuis Étiquettes de câbles." },
      { term: "État", text: "Branché, en réserve ou défectueux. Seuls les câbles branchés sont suivis par le plan et vérifiés." },
      { term: "Anomalies", text: "Vérifiées à chaque chargement, jamais bloquantes : tu peux toujours enregistrer un patch que l'app désapprouve." },
      { term: "point occupé", text: "Deux câbles ou plus sur une même prise. Normal sur un mult passif ou un jack Eurorack empilé, une erreur à peu près partout ailleurs — donc un avertissement, pas une erreur." },
      { term: "sens", text: "Le câble relie deux entrées ou deux sorties. En général une faute de frappe sur une extrémité." },
      { term: "signal incohérent", text: "Le câble dit audio et le point dit MIDI, ou quelque chose du genre. Ça vaut un coup d'œil, parfois c'est voulu." },
      { term: "point inconnu", text: "La machine n'a plus de point de ce nom — quelqu'un l'a renommé ou supprimé. Rebranche le câble sur le bon point." },
      { term: "machine disparue", text: "La machine à une extrémité a été supprimée. Le câble pend dans le vide." },
      { term: "extrémité en l'air", text: "Le câble est marqué branché mais une de ses extrémités n'a jamais été renseignée." },
      { term: "boucle", text: "Le signal revient d'où il est parti. Presque toujours un départ auxiliaire qui rentre dans une voie qui alimente ce même aux — voir le chapitre sur la console." },
    ],
    steps: [
      "Choisis la machine d'origine, puis son point ; la liste ne propose que les points qui existent.",
      "Choisis l'arrivée de la même façon.",
      "Donne-lui un code, une longueur et une couleur si tu repères tes câbles par la couleur.",
      "Laisse-le branché, ou mets-le en réserve s'il est enroulé au mur.",
    ],
    see: ["plan", "patchbays", "console"],
  },

  "cable-form": {
    title: "Brancher un câble",
    lede: "Un câble, c'est une machine et un point à chaque extrémité. Choisis d'abord la machine et la liste des points se réduit à ce que cette machine a vraiment.",
    points: [
      { term: "Extrémités déjà remplies", text: "Si tu arrives ici depuis un point libre d'une machine, d'une baie de brassage ou d'une console, cette extrémité est renseignée pour toi." },
      { term: "Signal", text: "Repris du point d'origine par défaut. Change-le si le câble transporte autre chose." },
      { term: "Longueur", text: "En mètres. Sert à l'impression des étiquettes et à totaliser ce qu'un cheminement te coûte en câble." },
    ],
    see: ["cables", "cable-labels"],
  },

  "cable-labels": {
    title: "Étiquettes de câbles",
    lede: "Une planche d'étiquettes à imprimer pour les câbles que tu sélectionnes — le code, les deux extrémités et le signal, à une taille qui tient sur un serre-câble.",
    points: [
      { term: "Filtrer", text: "Si tu arrives depuis une machine, seuls ses câbles sont imprimés. Sinon tu as tous les câbles branchés." },
      { term: "Imprimer", text: "Imprime en A4 sans marges. Chaque étiquette montre le code en grand et les deux extrémités en petit : elle se lit pareil quelle que soit l'extrémité que tu attrapes." },
    ],
    see: ["cables"],
  },

  // ---- Les baies de brassage ----
  patchbays: {
    title: "Baies de brassage",
    lede: "Chaque baie telle qu'elle est : une rangée de paires, chacune avec un point en haut et un point en bas, et un mode qui dit comment les deux sont reliés.",
    points: [
      { term: "Paire", text: "Un duo vertical : un point en haut, un point en bas. Ses points arrière s'appellent « Top 12 » et « Bottom 12 » ; ses jacks avant sont ceux où tu enfonces un cordon." },
      { term: "Normalisé", text: "Le haut et le bas sont reliés derrière la façade. Brancher dans l'un ou l'autre des jacks avant coupe la liaison et prend la main." },
      { term: "Semi-normalisé", text: "Reliés aussi, mais le jack avant du haut ne prend qu'une copie — la liaison reste. Seul le jack avant du bas la coupe. C'est celui qu'il te faut pour prélever un départ sans le tuer." },
      { term: "Thru", text: "Aucune liaison : chaque point arrière ne rejoint que son propre jack avant. À brancher au cordon." },
      { term: "Pourquoi ça compte ici", text: "Le plan suit un signal à travers une paire normalisée ou semi-normalisée comme si les deux points n'étaient qu'un fil. Une paire en thru l'arrête, parce que dans la vraie vie elle l'arrête aussi." },
    ],
    steps: [
      "Branche les points arrière comme des câbles vers Top n et Bottom n, comme n'importe quel autre point.",
      "Règle le mode de chaque paire pour qu'il corresponde au commutateur ou au câblage de la vraie baie.",
      "Nomme la paire pour que la baie se lise en mots — « Prophet L », « Comp in » — plutôt qu'en numéros.",
    ],
    see: ["patchbay", "cables", "plan"],
  },

  patchbay: {
    title: "Une baie de brassage",
    lede: "La baie, paire par paire : ce qui est câblé à l'arrière, comment la paire est normalisée, et ce qui est branché à l'avant.",
    points: [
      { term: "Rangées du haut et du bas", text: "Ce à quoi l'arrière de chaque paire est câblé. Par convention la rangée du haut porte les sources et celle du bas les arrivées, mais rien ici ne l'impose." },
      { term: "Pastille de mode", text: "N, H ou T sur chaque paire — normalisé, semi-normalisé ou thru." },
      { term: "Coller depuis un tableur", text: "Copie une ligne de cellules de ton vieux tableau et colle-la ici : les noms, les modes ou les deux, à partir de la paire que tu veux." },
      { term: "Imprimer le bandeau", text: "Un bandeau papier au pas de la baie, à glisser au-dessus ou en dessous des jacks." },
    ],
    see: ["patchbays", "patchbay-strip"],
  },

  "patchbay-strip": {
    title: "Imprimer un bandeau de baie",
    lede: "Les noms des paires en bandeau papier, au pas de la baie elle-même — un bandeau pour la rangée du haut, un pour celle du bas.",
    points: [
      { term: "Morceaux", text: "Une baie plus large que la feuille est découpée en morceaux que tu scotches bout à bout. Leur nombre est dans le sous-titre." },
      { term: "Imprimer", text: "Imprime à 100 % sans marges — à la moindre mise à l'échelle les noms ne tombent plus en face des jacks." },
    ],
    see: ["patchbay"],
  },

  // ---- Les consoles ----
  consoles: {
    title: "Consoles",
    lede: "Chaque console dessinée en tranches : ce qui est branché sur chaque voie, comment elle s'appelle, où elle est routée et par quelle prise elle sort.",
    points: [
      { term: "Une tranche", text: "Une voie, de haut en bas : le bandeau, ce qu'il y a dans ses prises mic / ligne / magnéto, son insert, son routage, et ce à quoi sa sortie est câblée." },
      { term: "Point ambre", text: "La source que tu as déclarée en service sur cette voie, quand plusieurs prises sont câblées." },
      { term: "Tranche en rouge", text: "Cette voie fait partie d'une boucle de retour. L'avertissement au-dessus dit de quel aux il s'agit." },
      { term: "Section master", text: "Tout ce qui n'est pas une voie — sous-groupes, aux, cue, mix, retours d'effet, 2-pistes, écoutes, casques, MIDI, alimentation — avec ce à quoi chaque prise est câblée." },
    ],
    see: ["console", "cables"],
  },

  console: {
    title: "La console, et l'Allen & Heath GS3",
    lede: "Ici la console a deux couches : ses points, qui sont le panneau arrière et ne changent jamais, et ses tranches, qui sont ce que la console fait aujourd'hui.",
    points: [
      { term: "Points et tranches", text: "Un point est une prise où tu peux brancher un câble. Une tranche, c'est un nom, une source, un routage et des départs auxiliaires — la session, pas le matériel. Rebrancher, c'est modifier des câbles ; renommer une voie, c'est modifier une tranche." },
      { term: "Source utilisée", text: "Mic, ligne ou magnéto. Sur la GS3, une voie a souvent ses trois sources câblées en même temps — l'app ne peut pas deviner ; lui dire laquelle est en service, c'est ce qui fait que le tracé du signal prend le bon chemin." },
      { term: "Routage", text: "Sortie directe, sous-groupes deux par deux, mix L/R, ou du texte libre pour les cas tordus. C'est ça qui décide par quelle prise le signal de la voie sort de la console." },
      { term: "Départs auxiliaires ouverts", text: "Les aux que cette voie alimente. Ça sert surtout à une chose : repérer un aux qui revient dans une voie qui envoie dans ce même aux." },
      { term: "Insert", text: "Départ sur la pointe, retour sur la bague. Un compresseur branché dans l'insert de la voie 4 apparaît dans la chaîne de la voie 4 quand tu suis le signal, pas comme un îlot à part." },
      { term: "Sortie de piste (Track Out)", text: "Sur une console in-line comme la GS3, cette prise fait deux métiers — la sortie directe de la voie, ou un sous-groupe. Lequel des deux dépend du routage que tu règles." },
      { term: "Coller depuis un tableur", text: "Une colonne à la fois — les noms, les sources, les routages, les aux, les notes — à partir de la voie que tu veux. Le vieux tableau y passe en quatre collages." },
    ],
    long: [
      "**La GS3 est une console in-line, et c'est toute la raison de ce chapitre.** Sur une console split, chaque sous-groupe a sa propre sortie : tu routes une voie vers le Group 3 et tu récupères le Group 3 sur la prise marquée Group 3 Out. La GS3 24/8/2 a 24 voies, 8 sous-groupes et un mix 2-pistes, mais pas une seule prise de sortie de sous-groupe. Les huit bus de sous-groupe sont mis en parallèle sur les Track Out des voies : le sous-groupe *g* apparaît sur le Track Out des voies *g*, *g*+8, *g*+16. Le sous-groupe 1 sort du Track Out de la voie 1, 9 ou 17 ; le sous-groupe 8 de la voie 8, 16 ou 24. Les mêmes 24 jacks portent soit le signal direct d'une voie, soit un sous-groupe, selon la façon dont la tranche est commutée.",
      "Donc quand tu coches « Grp 1-2 » sur la voie 17 et que l'app te dit que le signal sort par « Ch 1 Track Out, Ch 9 Track Out, Ch 17 Track Out », ce n'est pas un bug — ce sont les trois prises sur lesquelles tombe le sous-groupe 1, et le signal est sur celle que tu as câblée à ton interface. L'app le déduit des points : une console qui a des prises « Group n » dont aucune n'est une sortie est traitée comme in-line, et le sous-groupe est suivi jusqu'aux sorties de piste.",
      "**Chaque tranche porte deux voies.** La voie d'enregistrement prend l'entrée Mic ou Line et traverse le préampli, l'insert, l'EQ et le grand fader. La voie d'écoute prend le Tape In, à son propre niveau. En prise, tu enregistres par la voie d'enregistrement et tu écoutes sur la voie d'écoute : c'est pour ça que chaque voie de la GS3 a un Tape In, et pour ça que l'app te demande quelle source est en service au lieu de supposer celle qui se trouve être câblée.",
      "**L'insert est avant l'EQ**, câblé départ sur la pointe et retour sur la bague, sur un seul jack TRS. Dans l'app, l'insert est un point en Entrée/Sortie : un signal qui y arrive repart par ce que dit le routage de la tranche, si bien que le périphérique que tu y branches devient un morceau de la chaîne de cette voie quand tu suis le signal, au lieu d'être un cul-de-sac.",
      "**Les aux 1 à 4 sont post-fader**, et les 3 et 4 peuvent être basculés sur la voie d'écoute. L'app ne modélise pas le commutateur — elle modélise la conséquence. Si Aux 2 Out part dans un delay, que le delay revient dans l'entrée ligne de la voie 7, et que la tranche de la voie 7 dit qu'elle envoie dans l'Aux 2, tu as construit un oscillateur. C'est à ça que servent les tranches en rouge et l'avertissement de boucle : le tracé part d'Aux 2 Out, traverse chaque pédale et chaque baie de brassage sur son passage, et s'il revient sur une voie qui alimente l'Aux 2, il le signale, nomme les voies et te dit quel départ baisser.",
      "**Les retours d'effet et l'insert du mix tombent sur le mix.** Un signal qui entre par FX Return 3 ressort par Mix Out L et Mix Out R : une reverb renvoyée là est suivie jusqu'aux enceintes au lieu de s'arrêter au retour.",
      "**Remplir la console.** Ajoute-la comme matériel dans la catégorie Console et remplis ses points depuis le modèle Allen & Heath GS3 24/8/2 : 163 points, correctement nommés, avec les quatre aux, les huit inserts de sous-groupe, les quatre retours d'effet stéréo, les deux magnétos 2-pistes, les deux paires d'écoutes et le processeur de mute MIDI. La GS3 16 voies y est aussi. Si ton exemplaire diffère — un insert modifié, une voie morte — corrige ces points à la main après coup ; le modèle est un point de départ, pas un contrat.",
    ],
    see: ["consoles", "patchbays", "plan"],
  },

  "console-strip": {
    title: "Imprimer un bandeau de console",
    lede: "Les noms des voies en bandeau papier, à l'écartement des voies de la console, à scotcher au-dessus des faders.",
    points: [
      { term: "Ce qui est imprimé", text: "Le numéro de voie, le nom et le routage, dans l'ordre des voies, avec la couleur de la tranche si elle en a une." },
      { term: "Imprimer", text: "A4 en paysage, sans marges. Découpe le long du trait et scotche-le." },
    ],
    see: ["console"],
  },

  // ---- Le plan ----
  plan: {
    title: "Plan de câblage",
    lede: "Tous les câbles branchés en un seul schéma, rangés de gauche à droite selon le chemin déjà parcouru par le signal — les sources à gauche, les enceintes à droite.",
    points: [
      { term: "Les colonnes", text: "Chaque machine se place aussi à droite que son plus long chemin depuis une source. Ce n'est pas une grille bien rangée, mais ça se lit dans le sens où le son avance." },
      { term: "Couleurs", text: "La couleur du signal — l'audio en ambre, le MIDI en violet, le CV en vert, l'horloge en rose, et ainsi de suite. La légende est sur la page." },
      { term: "Boucles", text: "Un cycle dans le patch, trouvé par un calcul de composantes fortement connexes, dessiné en rouge. Un retour à travers une pédale, c'est parfois ce que tu veux ; à travers un aux, c'est rarement ce que tu veux." },
      { term: "Centrer", text: "Si tu arrives depuis une machine, seule cette machine et ce qu'elle atteint sont dessinés, dans les deux sens." },
      { term: "Nombre de sauts", text: "Survole un câble : il compte combien de machines le signal a déjà traversées. Utile quand quelque chose sonne plus maigre que prévu." },
    ],
    long: [
      "Le plan suit un signal à travers tout ce qui le fait passer : une paire de baie normalisée ou semi-normalisée, une pédale, un préampli ou un compresseur, et le routage d'une console. Il s'arrête devant tout ce qui ne le fait pas passer — une interface, une enceinte, un enregistreur — et devant une prise par laquelle il est déjà passé : c'est comme ça qu'un signal peut traverser trois fois la même baie de brassage sans que le tracé tourne en rond.",
    ],
    see: ["cables", "patchbays", "console"],
  },

  // ---- Les réservations ----
  bookings: {
    title: "Réservations",
    lede: "La semaine en grille, une colonne par jour, teintée par salle. Clique sur un jour pour le réserver, sur une session pour l'ouvrir.",
    points: [
      { term: "Option", text: "Dessinée en tirets et en pâle : c'est une option, pas une réservation ferme. Une confirmée est en trait plein." },
      { term: "Annulée", text: "Barrée et gardée, pas supprimée, comme ça la semaine raconte encore ce qui s'est passé." },
      { term: "Filtre par salle", text: "Affiché quand il y a plus d'une salle ; les pastilles gardent la semaine que tu regardes." },
      { term: "Recettes", text: "Les tarifs de la semaine additionnés, les annulations mises de côté. Les sessions payées sont marquées dans la liste en dessous." },
      { term: "Flux calendrier", text: "Un .ics auquel s'abonner, avec toutes les sessions. Mets-le en place une fois avec le script d'accès, puis abonne-toi dans Google Calendar, Apple Calendar ou n'importe quoi d'autre qui accepte une URL." },
    ],
    long: [
      "Le flux est en lecture seule et à sens unique : il montre tes réservations dans ton calendrier, il ne récupère pas les événements de l'autre côté. Abonne-toi sur `/bookings.ics?key=…`, avec la clé que le script d'accès a écrite dans ton environnement. Google rafraîchit un calendrier externe quand ça l'arrange — souvent des heures — alors prends-le pour la semaine dans ta poche, pas pour quelque chose qui se met à jour à la seconde où tu confirmes une session.",
    ],
    see: ["booking-form", "clients"],
  },

  "booking-form": {
    title: "Réserver une session",
    lede: "Un intitulé, une salle, un horaire, et pour qui c'est. Tout le reste est optionnel.",
    points: [
      { term: "Chevauchements", text: "Deux sessions dans la même salle en même temps sont signalées à l'enregistrement. Rien ne t'arrête — il arrive qu'une installation chevauche un démontage." },
      { term: "Type de session", text: "Enregistrement, production, mixage, mastering, répétition, location de matériel. Sert seulement à relire de quoi le mois était fait." },
      { term: "Tarif et payé", text: "Totalisés par semaine sur la page des réservations ; la case payé, c'est à toi de la tenir à jour." },
      { term: "Ingé son", text: "Du texte libre — qui tient la session." },
    ],
    see: ["bookings"],
  },

  clients: {
    title: "Clients",
    lede: "Qui réserve le studio : le nom, le nom d'artiste, comment le joindre, et toutes les sessions qu'il a faites.",
    points: [
      { term: "Nom d'artiste", text: "Affiché dans le calendrier quand il est renseigné, parce que c'est comme ça que tu l'appelles." },
      { term: "Sessions", text: "Comptées et totalisées par client, comme ça tu vois qui revient vraiment." },
    ],
    see: ["bookings"],
  },

  // ---- La gestion ----
  activity: {
    title: "Journal d'activité",
    lede: "Toutes les modifications jamais faites, par qui et quand, avec l'avant et l'après — et un chemin de retour vers n'importe quelle version antérieure.",
    points: [
      { term: "D'où ça vient", text: "Le CMS enregistre une version dans la même transaction que la modification elle-même. Cette page les lit. Le journal ne peut pas dériver des données, et rien ne peut écrire dans les données sans être enregistré." },
      { term: "Auteur", text: "Une personne, un jeton d'API, un agent ou le système. Les jetons sont nommés : le flux calendrier qui lit les réservations ressemble au flux calendrier, pas à toi." },
      { term: "Filtres", text: "Par personne, par ce qui a été modifié, par type de modification, par type d'auteur. Si tu arrives depuis un compte, le filtre est déjà sur cette personne." },
      { term: "Restaurer", text: "Proposé sur les entrées supprimées. L'entrée revient sous son propre identifiant : les câbles qui pointaient dessus pointent de nouveau dessus." },
      { term: "Une restauration", text: "Elle est enregistrée comme une modification à part entière : une restauration s'annule comme le reste." },
    ],
    see: ["history", "people"],
  },

  history: {
    title: "L'historique d'une entrée",
    lede: "Toutes les versions de cette entrée, et exactement quels champs ont changé entre deux d'entre elles.",
    points: [
      { term: "par rapport à la version précédente", text: "Ce que cette version a changé, par rapport à celle d'avant." },
      { term: "par rapport à maintenant", text: "Ce que cette version changerait, par rapport au contenu actuel. C'est celui-là qu'il faut lire avant de restaurer." },
      { term: "Restaurer", text: "Réécrit le contenu de cette version comme une nouvelle version. S'il est déjà identique à ce qui est en place, on te le dit au lieu de le faire." },
    ],
    see: ["activity"],
  },

  people: {
    title: "Comptes",
    lede: "Qui peut se connecter, et ce qu'il a le droit de faire. Ce sont les utilisateurs du CMS lui-même : il y a donc une seule liste de gens, pas deux.",
    points: [
      { term: "Rôles", text: "Un administrateur peut tout faire, y compris cette page. studio-staff lit et écrit le contenu et les médias du studio, et rien d'autre — pas les comptes, pas les réglages. C'est le script d'accès qui crée ce rôle." },
      { term: "Mots de passe", text: "Il est défini à la création du compte et affiché une seule fois. Tu peux en faire générer un si tu préfères ne pas l'inventer." },
      { term: "Ce qu'il ou elle a modifié →", text: "Filtre le journal d'activité sur cette personne." },
      { term: "Pourquoi pas de compte partagé", text: "Chacun se connecte avec son propre compte, comme ça le journal dit qui a fait quoi. Un compte partagé ou un jeton partagé ferait apparaître toutes les modifications sous le même auteur — et c'est justement la seule chose à laquelle le journal sert." },
    ],
    long: [
      "La connexion avec Google arrive. GoHead a gagné la connexion OpenID Connect sur `master` (authorization code flow avec PKCE, `GET /auth/sso/google/start`) : elle sera donc là dans la version qui suit la v0.7.0 — celle que le `docker-compose.yml` de cette app fixe. Cette app ne s'en sert pas encore : sa page de connexion demande toujours un nom de compte et un mot de passe. La brancher, c'est proposer un bouton *Se connecter avec Google* qui passe la main à GoHead et accepter le jeton qu'il renvoie, et ça ne change rien d'autre — l'app ne détient jamais qu'un jeton GoHead, donc les rôles, les permissions et ce journal continuent de marcher sans qu'on y touche.",
    ],
    see: ["activity"],
  },
  },

  parts: {
  idea: { title: "L'idée", blurb: "De quoi l'app est faite, et l'écran unique qui la résume." },
  gear: { title: "Le matériel", blurb: "Les machines, leurs points, et où elles se trouvent physiquement." },
  wiring: { title: "Le câblage", blurb: "Les câbles, les baies de brassage et la console — et comment suivre un signal à travers les trois." },
  business: { title: "Le business", blurb: "Les sessions, pour qui elles sont, et le flux calendrier." },
  running: { title: "La gestion", blurb: "Qui a le droit de faire quoi, et ce que chacun a fait." },
  },

  glossary: {
  normal: { term: "Normalisé", text: "Une paire de baie dont le haut et le bas sont reliés derrière la façade. Brancher dans l'un ou l'autre des jacks avant coupe la liaison." },
  half_normal: { term: "Semi-normalisé", text: "Reliés aussi, mais le jack avant du haut ne prend qu'une copie et laisse la liaison tranquille. Seul celui du bas la coupe." },
  thru: { term: "Thru", text: "Une paire dont les deux points ne sont pas reliés : chacun ne rejoint que son propre jack avant." },
  insert: { term: "Insert", text: "Un seul jack TRS qui porte à la fois un départ (la pointe) et un retour (la bague), pour mettre un périphérique dans une voie. Avant l'EQ sur la GS3." },
  "in-line": {
    term: "Console in-line",
    text: "Une console dont les voies portent à la fois la voie d'enregistrement et la voie d'écoute, et dont les bus de sous-groupe sortent par les sorties de piste des voies plutôt que par leurs propres prises. La GS3 en est une.",
  },
  "track-out": { term: "Sortie de piste", text: "La prise de sortie d'une voie de la GS3. Elle porte le signal direct de cette voie, ou un sous-groupe — c'est le routage qui décide." },
  group: { term: "Sous-groupe", text: "Un bus vers lequel plusieurs voies sont routées et commandées ensemble. La GS3 en a huit, mis en parallèle sur les sorties de piste des voies g, g+8, g+16." },
  aux: { term: "Départ auxiliaire", text: "Un mix à part prélevé sur les voies, pour les effets ou pour le casque d'un musicien. Post-fader sur la GS3." },
  "direct-out": { term: "Sortie directe", text: "Le signal propre d'une voie, droit en sortie, sans passer par les sous-groupes ni par le mix. Sur la GS3, elle partage la prise de sortie de piste avec les sous-groupes." },
  strip: { term: "Tranche", text: "Dans cette app : le nom, la source, le routage, les départs auxiliaires, la couleur et la note d'une voie. L'état de la session, pas celui du matériel." },
  port: { term: "Point", text: "Une prise physique sur une machine, avec un nom, un sens, un signal et un connecteur." },
  revision: { term: "Version", text: "Une version enregistrée d'une entrée, écrite par le CMS dans la même transaction que la modification." },
  },
};
