/**
 * Les pas-à-pas, en français.
 */
import type { Tutorials } from "./types";

export const fr: Tutorials = {
  // ------------------------------------------------------------------
  gs3: {
    title: "Enregistrer une session sur la GS3",
    blurb: "D'une console à zéro jusqu'à une feuille de rappel qui te la remet en dix minutes — et pourquoi le routage in-line piège tout le monde, une fois.",
    time: "Une demi-heure la première fois, dix minutes ensuite.",
    needs: [
      "La console saisie comme matériel, catégorie **Console**, avec ses points remplis depuis le modèle **Allen & Heath GS3 24/8/2**. Ça te donne 163 prises correctement nommées ; sans elles, la page console n'a rien à dessiner.",
      "La Fireface et les instruments saisis aussi, même en gros. Une voie dont la source n'est pas dans l'app peut quand même être nommée, mais aucun signal ne pourra être suivi à travers elle.",
      "La console ouverte dans **Consoles → Allen & Heath GS3**.",
    ],
    steps: [
      {
        title: "Décide la liste des voies avant de toucher à la console",
        body: [
          "Vingt-quatre voies, ça paraît large jusqu'au moment où le Virus et les deux boîtes à rythmes en ont mangé six en paires stéréo. Établis la liste d'abord, sur papier ou directement dans les bandeaux ici, et garde-la stable d'une session à l'autre — tout l'intérêt d'une feuille de rappel, c'est que la voie 6 soit encore la même chose le mois prochain.",
          "Une liste qui marche dans cette pièce : **1** Juno-106, **2** Juno-6, **3** Minitaur, **4** DX7, **5** Solina, **6** MB33, **7–8** Virus TI2 L/R, **9–10** RD-9 L/R, **11–12** RD-8 L/R, **13** TD-8 mix, **14** MPC, **15–16** Eurorack L/R, **17–20** en réserve pour les sessions au Push 2 et pour ce qui est loué, **21–22** retour Space Echo, **23–24** retour 2-pistes.",
        ],
        doThis: [
          "Clique sur le bandeau d'une voie et tape le nom. Tab passe à la suivante.",
          "Ou copie toute la colonne de ton vieux tableur et passe par **Coller depuis un tableur** → *Les noms*, à partir de la voie 1.",
          "Donne une couleur aux voies de batterie pour que les paires se repèrent d'un coup d'œil.",
        ],
        aside: {
          kind: "why",
          text: "Le nom appartient à la tranche, pas au point. Renommer la voie 6 change ce que cette session appelle comme ça ; ça ne déplace aucun câble. C'est cette séparation qui permet à la feuille de rappel de changer chaque semaine pendant que le panneau arrière, lui, ne bouge pas.",
        },
      },
      {
        title: "Dis quelle prise est vraiment en service",
        body: [
          "Chaque voie de la GS3 a une entrée mic, une entrée ligne et un retour magnéto, et dans un studio comme celui-ci deux ou trois d'entre elles sont câblées en permanence. L'app ne peut pas deviner laquelle porte du signal aujourd'hui, et si elle devine mal, tous les tracés qui passent par cette voie sont faux.",
          "Chaque tranche a donc une **Source utilisée** : mic, ligne ou magnéto. Règle-la voie par voie. Le point ambre sur la tranche, c'est l'app qui te dit que plusieurs prises sont câblées et qu'elle s'en tient à ce que tu as déclaré.",
        ],
        doThis: [
          "Sur chaque tranche, choisis Mic / Ligne / Magnéto sous le bandeau.",
          "Tout, dans cette pièce, arrive sur une entrée ligne : mets donc toutes les voies sur Ligne et ne change que celles où tu mets vraiment un micro.",
        ],
        aside: {
          kind: "why",
          text: "C'est la console in-line qui se montre. La voie d'enregistrement (mic ou ligne → préampli → insert → EQ → fader) et la voie d'écoute (le retour magnéto, à son propre niveau) sont deux signaux dans une seule tranche. En prise, tu enregistres par la voie d'enregistrement et tu écoutes sur la voie d'écoute : c'est pour ça que chaque voie a un retour magnéto, et pour ça que la question doit être posée.",
        },
      },
      {
        title: "Règle le gain au PFL, pas au fader",
        body: [
          "Le pre-fade listen est le premier réglage qu'on devrait attraper et celui qu'on oublie le plus facilement. Enclenche le PFL sur une voie et cette voie part dans la régie et dans le casque, prise avant le fader et avant le mute. Rien ne change en aval : les sous-groupes, le mix et les aux ne le voient jamais.",
          "C'est pour ça que c'est le bon outil pour régler un gain. Enclenche le PFL, joue le truc le plus fort que le Juno va sortir, monte le gain jusqu'à ce que la modulation se tienne là où tu la veux, relâche le PFL. Le fader n'a pas bougé, le mix n'a pas bougé.",
        ],
        doThis: [
          "Tourne le bouton **Gain** de la tranche pour qu'il corresponde à ce que tu as réglé sur la console.",
          "Clique sur **PFL** sur la tranche pendant que tu l'écoutes, et re-clique pour le relâcher quand tu as fini.",
          "Règle le **Fader** en dernier, et seulement pour le mix.",
        ],
        aside: {
          kind: "watch",
          text: "Le plateau te dit quelles voies ont le PFL enclenché, parce qu'un PFL resté enfoncé est la raison habituelle pour laquelle la régie n'entend qu'un seul instrument alors que le mix, lui, va très bien. Regarde cette liste avant d'accuser un câble.",
        },
      },
      {
        title: "Route la voie, et découvre les sorties de piste",
        body: [
          "C'est l'endroit de la GS3 qui piège tout le monde, exactement une fois. La console est une 24/8/2 — vingt-quatre voies, huit sous-groupes, un mix 2-pistes — et elle n'a **aucune prise de sortie de sous-groupe**. Les huit bus de sous-groupe sont mis en parallèle sur les Track Out des voies : le sous-groupe *g* apparaît sur le Track Out des voies *g*, *g*+8 et *g*+16. Le sous-groupe 1 sort du Track Out de la voie 1, ou 9, ou 17. Le sous-groupe 8 de la voie 8, 16 ou 24.",
          "Donc quand tu routes la voie 13 vers **Grp 1-2** et que l'app te dit que le signal sort par « Ch 1 Track Out, Ch 9 Track Out, Ch 17 Track Out », elle ne s'emmêle pas — ce sont les trois jacks sur lesquels le sous-groupe 1 tombe physiquement, et le signal est sur celui que tu as câblé à la Fireface. Choisis-en un par sous-groupe et tiens-toi à ce choix : les sorties de piste 1–8 vers les huit premières entrées de la Fireface, c'est le choix évident, et ça laisse libres les sorties de piste des voies 9–24 pour servir de sorties directes.",
          "Pour une session multipiste sans histoire, tu n'as pas besoin des sous-groupes du tout. Route chaque voie sur **Sortie directe** et le signal propre de chaque voie sort par sa propre sortie de piste, une voie par entrée d'interface. Les sous-groupes servent quand tu veux huit stems plutôt que vingt-quatre pistes, ou un seul fader sur toute la boîte à rythmes.",
        ],
        doThis: [
          "Sur chaque tranche, règle le **Routage** : *Sortie directe* pour une piste par voie, *Grp 1-2* … *Grp 7-8* pour des stems, *Mix L/R* pour tout ce qui ne part qu'aux écoutes.",
          "Lis le petit schéma à côté de la tranche : il allume le trajet que le signal prend vraiment avec les réglages que tu lui as donnés, et nomme les prises par lesquelles il sort.",
          "Branche les sorties de piste que tu as choisies sous forme de câbles, sur les points de la console, pour que le plan puisse les suivre.",
        ],
        aside: {
          kind: "why",
          text: "L'app le déduit des points, pas d'une règle écrite pour la GS3 : une console qui a des prises « Group n » dont aucune n'est une sortie est traitée comme in-line, et le sous-groupe est suivi jusqu'aux sorties de piste. Saisis une console split et elle se comporte comme une console split.",
        },
      },
      {
        title: "Note l'EQ, les deux fréquences balayables comprises",
        body: [
          "Trois bandes. Le HF est un shelf fixe à 12 kHz. Le médium est balayable, de 300 Hz à 12 kHz. Le LF est balayable aussi, de 20 Hz à 600 Hz. Les trois coupent et remontent jusqu'à 14 dB. Cette console n'a ni pad ni inverseur de phase, donc tu n'en trouveras pas ici non plus.",
          "Les deux bandes balayables sont celles sur lesquelles ça vaut la peine d'être tatillon. « Médium +4 » ne voudra plus rien dire dans un mois si tu n'as pas noté aussi que le balayage était à 2,5 kHz. Les deux boutons sont sur la tranche : règle la fréquence d'abord, le niveau ensuite, dans le même ordre que sur la console.",
        ],
        doThis: [
          "Fais glisser un bouton, ou roule la molette dessus. Maintiens **Shift** en glissant pour un réglage fin.",
          "Ou clique sur un bouton et utilise les flèches ; **Home** et **End** vont aux extrêmes.",
          "Laisse une bande au centre si tu n'y as pas touché — un bouton au centre se lit « pas utilisée » sur la feuille.",
        ],
      },
      {
        title: "Mets le compresseur dans l'insert, pas dans le patch",
        body: [
          "L'xpressor de la voie 9 a sa place dans l'insert de cette voie : un seul jack TRS, départ sur la pointe, retour sur la bague, **avant l'EQ** sur cette console. Branche-le comme ça et le compresseur est à l'intérieur de la chaîne de la voie 9. Suis le signal dans le plan de câblage et tu obtiens Juno → voie 9 → xpressor → retour dans la voie 9 → EQ → fader → sortie de piste, c'est-à-dire ce qui se passe vraiment.",
          "Branche-le plutôt comme un boîtier à part dans le cheminement et le plan le dessine en îlot, parce que c'est tout ce qu'il peut voir. L'insert est le seul moyen de dire à l'app qu'un périphérique est *à l'intérieur* d'une voie.",
        ],
        doThis: [
          "Ajoute un câble de **Ch 9 Insert** vers l'entrée du compresseur, et un autre de sa sortie vers ce même insert.",
          "Sur la tranche, l'insert apparaît câblé dès que les deux câbles sont là.",
        ],
        aside: {
          kind: "watch",
          text: "Avant l'EQ, ça veut dire que le compresseur entend le signal avant ta correction : un gros coup de grave ne le poussera pas davantage. Si tu veux l'inverse, l'EQ doit se faire avant la console.",
        },
      },
      {
        title: "Envoie dans le Space Echo, et guette la boucle",
        body: [
          "Les aux 1 à 4 sont post-fader, sur deux axes concentriques — 1 sur 2, 3 sur 4. Les aux 3 et 4 peuvent être basculés sur la voie d'écoute ; l'app ne modélise pas le commutateur, elle modélise ce que le commutateur provoque.",
          "Envoie la voie 11 dans l'Aux 2, câble **Aux 2 Out** vers l'entrée du RE-201, et fais revenir le Space Echo sur l'entrée ligne d'une voie libre — 21 et 22 dans la liste plus haut. Maintenant le point important : **si la voie sur laquelle l'écho revient envoie elle aussi dans l'Aux 2, tu as construit un oscillateur.** L'app le trouve. La voie de retour passe en rouge, l'avertissement au-dessus du plateau nomme l'aux et les voies qui ferment la boucle, et te dit quel départ baisser.",
          "Ça vaut le coup de le monter exprès une fois, juste pour voir l'avertissement se déclencher, parce que la vraie version arrive à deux heures du matin avec un client dans la pièce.",
        ],
        doThis: [
          "Ouvre les boutons d'aux sur les tranches des voies que tu veux dans l'écho.",
          "Câble **Aux 2 Out** → entrée du RE-201, et sortie du RE-201 → l'entrée ligne de la voie de retour, sous forme de câbles sur les points de la console.",
          "Laisse l'Aux 2 de la voie de retour à zéro.",
        ],
        aside: {
          kind: "watch",
          text: "Le RE-201 n'a qu'un jack de sortie, qui porte l'effet et le direct ensemble : il n'y a pas de retour effet seul à espérer, le direct que tu lui envoies revient avec l'écho. Soit tu l'acceptes et tu baisses la voie d'origine, soit tu gardes le Space Echo en insert sur une voie au lieu d'en faire un départ aux pour toute la pièce. (Jette un œil à ton exemplaire avant d'y croire — c'est le modèle qui annonce une seule sortie.)",
        },
      },
      {
        title: "Enregistre la feuille, imprime le bandeau, et reviens-y",
        body: [
          "C'est toute la raison pour laquelle la tranche, ici, porte des boutons. La GS3 est analogique : la session finie, les réglages sont perdus si personne ne les a notés. Ce que tu as réglé — le gain, les trois bandes et les deux fréquences balayables, les quatre aux, le cue, le pan, le PFL, le mute, le fader, le routage et le nom — est enregistré avec la voie et sera là la prochaine fois que tu ouvres la console.",
          "Imprime le bandeau et scotche-le au-dessus des faders. Il porte le numéro de voie, le nom et le routage, à l'écartement des voies de la console. A4 en paysage, sans marges, 100 % — à la moindre mise à l'échelle les noms ne tombent plus en face.",
        ],
        doThis: [
          "**Imprimer le bandeau**, en haut de la page console.",
          "Session suivante : ouvre la console, lis la feuille, remets les boutons de la machine dans la même position.",
          "Quand quelque chose a bougé pour de bon, change-le ici aussi — chaque enregistrement est une version, donc tu peux voir à quoi ressemblait la console mardi dernier.",
        ],
      },
    ],
    wrap: "Tu as maintenant une console qui se documente elle-même : qui est sur quelle voie, quelle prise est en service, par où chaque voie sort, et la position de chaque bouton. L'étape suivante, c'est de faire porter tout ça par les baies de brassage : c'est l'autre pas-à-pas.",
    see: ["console", "consoles", "console-strip", "plan"],
  },

  // ------------------------------------------------------------------
  patchbay: {
    title: "Câbler les trois baies de brassage",
    blurb: "144 jacks, une convention qui survit au contact d'une session, et un plan de câblage qui trace du Juno jusqu'aux écoutes sans trou.",
    time: "Un après-midi au fer à souder ; une heure dans l'app.",
    needs: [
      "Les trois baies saisies comme matériel, catégorie **Baie de brassage**, points remplis depuis le modèle **Patchbay, 48 points (24 columns)**. Chacune a donc 24 paires — 48 jacks, un point arrière Top *n* et un point arrière Bottom *n* par paire.",
      "La console et la Fireface saisies, avec leurs points — les baies n'existent à peu près que pour atteindre ces deux-là.",
      "Une décision sur le rôle de chaque baie, c'est-à-dire la première étape.",
    ],
    steps: [
      {
        title: "Donne un rôle à chaque baie",
        body: [
          "Trois baies de 48 points, ça fait 144 jacks en 72 paires, et ce qui sépare une baie que tu utilises vite d'une baie que tu déchiffres, c'est qu'elle ait un seul rôle. Les baies fourre-tout sont la raison pour laquelle on arrête de se servir d'une baie de brassage et qu'on retourne ramper derrière le rack.",
          "Le découpage qui convient à cette pièce : **Patchbay I**, c'est la console — les sorties de piste en haut, les retours magnéto et les entrées ligne en bas. **Patchbay II**, c'est la Fireface — ses sorties en haut, ses entrées en bas. **Patchbay III**, c'est tout le reste : les sorties des instruments en haut, les périphériques et l'Eurorack en bas. Les baies I et II vivent dans le Rack A, comme ça la console et l'interface se rejoignent au même endroit ; la III est dans le Rack B avec les synthés et les modules.",
        ],
        doThis: [
          "Renomme les trois machines pour dire ce qu'elles sont — « Baie console », « Baie interface », « Baie instruments » vaut mieux que « Patchbay I ».",
          "Mets chacune dans son rack depuis la page **Racks & emplacements**, pour que le plan du studio soit juste.",
        ],
      },
      {
        title: "Les sources en rangée du haut, les arrivées en rangée du bas — partout, sans exception",
        body: [
          "C'est une convention, pas une règle que le matériel connaît, et l'app ne l'impose pas. Adopte-la quand même et tiens-la sur les trois baies : **la rangée du haut, c'est toujours quelque chose qui sort d'une machine, la rangée du bas toujours quelque chose qui entre dans une machine.** Du coup un cordon va toujours du haut vers le bas, et tu lis la baie sans réfléchir.",
          "Le jour où une baie est montée à l'envers des deux autres est le jour où tu commences à brancher des sorties dans des sorties, en fin de nuit.",
        ],
        aside: {
          kind: "why",
          text: "Ça donne aussi du sens à la normalisation. Une paire normalisée avec une source en haut et une arrivée en bas, c'est une liaison fixe qui reste branchée jusqu'à ce que tu l'interrompes — et c'est exactement ce qu'on attend d'une baie de brassage la plupart du temps.",
        },
      },
      {
        title: "Branche les arrières, sous forme de câbles",
        body: [
          "Les points arrière sont des points comme les autres : **Top 12** et **Bottom 12** sur la baie, et un câble de chacun vers ce à quoi il est soudé. C'est la partie longue et ennuyeuse, et c'est elle qui fait marcher tout le reste, parce que le plan de câblage ne peut suivre que ce qu'il connaît.",
          "Avance paire par paire, en descendant la liste. Track Out 1 → Top 1. Track Out 2 → Top 2. Tape In 1 → Bottom 1. C'est répétitif exprès : une baie où Top 7 est la septième chose de la liste est une baie que tu peux utiliser dans le noir.",
        ],
        doThis: [
          "**Câbles → Ajouter un câble**, ou ajoute-les depuis la page de la baie.",
          "Nomme la paire au fur et à mesure — c'est le nom de la paire que montrent la baie dessinée et le bandeau imprimé.",
          "Écris des mots, pas des numéros : « Juno 106 », « Comp in », « Départ écho ». « Top 23 » ne t'apprend rien au moment où tu en as besoin.",
        ],
        aside: {
          kind: "watch",
          text: "Ce sont des baies en jack 6,35 mm TRS : une paire peut porter une ligne symétrique comme une ligne asymétrique, et rien, physiquement, ne t'empêche de brancher un départ d'insert dans une ligne micro. L'app te signale qu'un câble et le point où il arrive n'annoncent pas le même signal — cet avertissement existe parce que le matériel, lui, ne dira rien.",
        },
      },
      {
        title: "Choisis le mode de chaque paire, et assume-le",
        body: [
          "Trois modes, et le choix change ce que fait la baie quand rien n'est branché à l'avant.",
          "**Normalisé** — le haut et le bas sont reliés derrière la façade. Le signal passe sans cordon. Brancher dans l'un ou l'autre des jacks avant coupe la liaison et prend la main. C'est le réglage par défaut d'une liaison fixe : Track Out 1 rejoint Tape In 1 tout seul, et le jour où tu le veux ailleurs tu branches et il cesse d'aller dans Tape In 1.",
          "**Semi-normalisé** — reliés aussi, mais le jack avant du **haut** ne prend qu'une copie : la liaison reste. Seul celui du bas la coupe. C'est celui qu'il te faut pour prélever un départ sans tuer là où il va déjà : branche dans le haut de la paire de la RD-9 et la boîte à rythmes atteint toujours la console *et* alimente maintenant aussi le Space Echo.",
          "**Thru** — aucune liaison. Chaque point arrière ne rejoint que son propre jack avant, et rien ne circule tant que tu n'as pas mis un cordon. À utiliser pour tout ce qui ne doit jamais être relié par accident : l'entrée d'un ampli de puissance, une arrivée de CV, les retours d'insert.",
        ],
        doThis: [
          "Règle le mode paire par paire sur la page de la baie — la pastille affiche **N**, **H** ou **T**.",
          "Mets les liaisons fixes console-interface en **normalisé**, les sorties d'instruments en **semi-normalisé**, et tout ce qui mord en **thru**.",
          "Fais correspondre ce que la vraie baie est câblée ou commutée à faire. L'app te croit.",
        ],
        aside: {
          kind: "why",
          text: "Le plan de câblage suit un signal à travers une paire normalisée ou semi-normalisée comme si les deux points n'étaient qu'un fil, et s'arrête net sur une paire en thru — parce que dans la vraie vie il s'arrête aussi. Un tracé qui s'arrête sur une paire en thru, c'est l'app qui a raison, pas un câble manquant.",
        },
      },
      {
        title: "Remplis les noms depuis le tableur au lieu de les taper",
        body: [
          "Si les baies sont déjà étiquetées quelque part — un tableur, un fichier texte, la photo de l'ancien bandeau — tu n'as pas à retaper soixante-douze noms de paires. Copie une colonne de cellules et dépose-la ici.",
          "Tu peux coller les étiquettes, les modes, ou les deux, à partir de la paire que tu veux : une baie à moitié faite se termine donc depuis une liste partielle.",
        ],
        doThis: [
          "**Coller depuis un tableur**, sur la page de la baie.",
          "Choisis la paire sur laquelle tombe la première valeur, et si tu colles des étiquettes ou des modes.",
          "Vérifie l'aperçu avant de valider — il te montre ce qui est sur le point de changer.",
        ],
      },
      {
        title: "Imprime les bandeaux et mets-les sur la baie",
        body: [
          "Une baie sans étiquettes est une baie dont personne ne se sert. Imprime un bandeau pour la rangée du haut et un pour celle du bas, au pas des jacks de la baie, et glisse-les en place.",
          "Une baie de 24 paires est plus large qu'une feuille de papier : le bandeau sort donc en morceaux que tu scotches bout à bout — le sous-titre de la page d'impression te dit combien. Imprime à 100 % sans marges. À la moindre mise à l'échelle, les noms glissent loin des jacks auxquels ils appartiennent, ce qui est pire que pas de bandeau du tout.",
        ],
        doThis: [
          "**Imprimer les bandeaux**, sur la page de la baie — un bandeau par rangée.",
          "Découpe le long du trait, scotche les morceaux, glisse-les au-dessus et en dessous des jacks.",
        ],
      },
      {
        title: "Vérifie-le avec le plan de câblage",
        body: [
          "Et maintenant la vérification qui te dit si le câblage que tu as saisi est bien le câblage que tu as. Ouvre le **Plan de câblage**. Tout ce qui est branché est dessiné de gauche à droite dans le sens où le son avance : les sources à gauche, les enceintes à droite.",
          "Trouve le Juno-106 et suis-le. Ça doit donner Juno → baie instruments → baie console → une voie de la GS3 → la sortie de piste de cette voie → baie interface → Fireface, puis ressortir par la console vers les ADAM A7. Si le tracé s'arrête quelque part, le trou est réel : soit un câble que tu n'as pas saisi, soit une paire que tu as déclarée en thru alors qu'elle est normalisée, soit une voie dont la source utilisée pointe la mauvaise prise.",
          "Entre d'abord dans une machine et le plan ne dessine que cette machine et ce qu'elle atteint, dans les deux sens : c'est le moyen le plus rapide de traquer un signal à travers trois baies.",
        ],
        doThis: [
          "**Plan de câblage**, puis survole un câble pour voir combien de machines le signal a déjà traversées.",
          "Les traits rouges sont des boucles. À travers une pédale, c'est parfois ce que tu veux ; à travers un aux, presque jamais.",
          "Corrige ce que les trous te montrent, puis relance.",
        ],
        aside: {
          kind: "watch",
          text: "Le tracé s'arrête devant tout ce qui ne fait pas passer le signal — une interface, une enceinte, un enregistreur — et devant une prise par laquelle il est déjà passé. C'est ce dernier point qui permet à un signal de traverser trois fois la même baie sans que le plan tourne en rond indéfiniment.",
        },
      },
    ],
    wrap: "Trois baies avec un rôle chacune, une convention qui tient, des modes qui correspondent à la soudure, des bandeaux imprimés, et un plan qui trace de bout en bout. À partir de là, recâbler c'est modifier un câble dans l'app et déplacer un cordon dans le rack — et la semaine prochaine, tu sauras encore ce qu'est Top 23.",
    see: ["patchbays", "patchbay", "patchbay-strip", "cables", "plan"],
  },
};
