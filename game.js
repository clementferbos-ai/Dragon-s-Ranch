let collectionDragons = [];

let succesDebloques = [];

let statistiquesSucces = {

    dragonsSauvagesCaptures: 0,

    dragonsEleves: 0

};

const MAX_ACTIONS_PAR_JOUR = 8;

let actionsRestantes = MAX_ACTIONS_PAR_JOUR;

let dateDernierRenouvellement = null;
let heureDernierRenouvellement = null;

let idDragonFicheOuverte = null;

let oeufEnAttente = false;

let dragonsSauvagesActuels = [];

let minuteurSauvegardeDistante = null;

let idPereSelectionne = "";
let idMereSelectionne = "";
let vueParents = "grille";

// =========================================
// ÉCONOMIE : PIASTRES DRACONIQUES, MISSIONS
// ET BOUTIQUE
// =========================================

let piastresDraconiques = 0;

let inventaireObjets = {};

let missionsActuelles = [];

let dateDernierRenouvellementMissions = null;

const NOMBRE_MISSIONS_PAR_JOUR = 3;

// Libellés d'affichage des difficultés (les clés internes
// restent sans accent, sans espace : elles servent aussi
// de nom de classe CSS).

const libellesDifficulteMissions = {
    facile: "Facile",
    intermediaire: "Intermédiaire",
    difficile: "Difficile"
};

// Espèces utilisées pour décliner certaines missions une
// fois par race (avec le bon article pour le libellé).

const especesPourMissions = [
    { nom: "Vouivre", cle: "vouivre", article: "une" },
    { nom: "Hydre", cle: "hydre", article: "une" },
    { nom: "Dragon oriental", cle: "dragon_oriental", article: "un" },
    { nom: "Dragon européen", cle: "dragon_europeen", article: "un" },
    { nom: "Wyrm", cle: "wyrm", article: "un" }
];

const catalogueMissions = {

    // =========================
    // FACILES
    // =========================

    capturer_dragons: {
        libelle: "Capturer 2 dragons sauvages en expédition",
        difficulte: "facile",
        recompense: 20,
        objectif: 2
    },

    faire_evaluation: {
        libelle: "Réaliser 1 évaluation de dragon",
        difficulte: "facile",
        recompense: 20,
        objectif: 1
    },

    obtenir_deux_oeufs: {
        libelle: "Obtenir 2 œufs de dragons (par reproduction)",
        difficulte: "facile",
        recompense: 20,
        objectif: 2
    },

    capturer_peu_commun: {
        libelle: "Capturer un dragon de rareté peu commune",
        difficulte: "facile",
        recompense: 20,
        objectif: 1
    },

    oeuf_peu_commun: {
        libelle: "Obtenir un œuf de rareté peu commune",
        difficulte: "facile",
        recompense: 20,
        objectif: 1
    },

    recueillir_don: {
        libelle: "Recueillir un dragon depuis la bourse aux dons",
        difficulte: "facile",
        recompense: 20,
        objectif: 1
    },

    // =========================
    // INTERMÉDIAIRES
    // =========================

    faire_reproduction: {
        libelle: "Réaliser 1 reproduction",
        difficulte: "intermediaire",
        recompense: 50,
        objectif: 1
    },

    epuiser_actions: {
        libelle: "Utiliser toutes ses actions du jour (8/8)",
        difficulte: "intermediaire",
        recompense: 50,
        objectif: MAX_ACTIONS_PAR_JOUR
    },

    obtenir_ecailles_rares: {
        libelle: "Obtenir un dragon aux écailles Rares ou plus",
        difficulte: "intermediaire",
        recompense: 50,
        objectif: 1
    },

    obtenir_dragon_parfait: {
        libelle: "Obtenir un dragon avec un score de perfection ≥ 60%",
        difficulte: "intermediaire",
        recompense: 50,
        objectif: 1
    },

    dragon_rare_reproduction: {
        libelle: "Obtenir un dragon de rareté Rare par reproduction",
        difficulte: "intermediaire",
        recompense: 50,
        objectif: 1
    },

    dragon_rare_capture: {
        libelle: "Obtenir un dragon de rareté Rare par capture",
        difficulte: "intermediaire",
        recompense: 50,
        objectif: 1
    },

    potentiel_3s: {
        libelle: "Obtenir un dragon avec 3 statistiques au potentiel S",
        difficulte: "intermediaire",
        recompense: 50,
        objectif: 1
    },

    // =========================
    // DIFFICILES
    // =========================

    debloquer_succes: {
        libelle: "Débloquer un nouveau succès aujourd'hui",
        difficulte: "difficile",
        recompense: 100,
        objectif: 1
    },

    dragon_exceptionnel_reproduction: {
        libelle: "Obtenir un dragon de rareté Exceptionnelle par reproduction",
        difficulte: "difficile",
        recompense: 100,
        objectif: 1
    },

    dragon_exceptionnel_capture: {
        libelle: "Obtenir un dragon de rareté Exceptionnelle par capture",
        difficulte: "difficile",
        recompense: 100,
        objectif: 1
    },

    score_brut_100: {
        libelle: "Obtenir un dragon avec un score de perfection brut > 100 (sur 140)",
        difficulte: "difficile",
        recompense: 100,
        objectif: 1
    },

    potentiel_5s: {
        libelle: "Obtenir un dragon avec 5 statistiques au potentiel S",
        difficulte: "difficile",
        recompense: 100,
        objectif: 1
    }

};

// Déclinaison de deux missions de capture par espèce :
// une "peu commune" (intermédiaire) et une "rare" (difficile).

especesPourMissions.forEach(function (espece) {

    catalogueMissions[`capturer_${espece.cle}_peu_commun`] = {

        libelle:
            `Attraper ${espece.article} ${espece.nom} `
            + "de rareté peu commune",

        difficulte: "intermediaire",
        recompense: 50,
        objectif: 1,
        espece: espece.nom,
        seuilEtoiles: 2

    };

    catalogueMissions[`capturer_${espece.cle}_rare`] = {

        libelle:
            `Attraper ${espece.article} ${espece.nom} `
            + "de rareté rare",

        difficulte: "difficile",
        recompense: 100,
        objectif: 1,
        espece: espece.nom,
        seuilEtoiles: 3

    };

});

const catalogueBoutique = {

    serum_plus_un: {
        nom: "Sérum d'altération +1",
        description:
            "Augmente d'un point une statistique au choix d'un dragon (plafonné à 20).",
        type: "serum",
        valeur: 1,
        prix: 1000
    },

    serum_plus_deux: {
        nom: "Sérum d'altération +2",
        description:
            "Augmente de deux points une statistique au choix d'un dragon (plafonné à 20).",
        type: "serum",
        valeur: 2,
        prix: 2500
    },

    mutagene_aleatoire_yeux: {
        nom: "Mutagène oculaire aléatoire",
        description:
            "Change au hasard la couleur des yeux d'un dragon (jamais blanc, noir, or, ni de mutation esthétique).",
        type: "mutagene_aleatoire",
        cible: "yeux",
        prix: 500
    },

    mutagene_aleatoire_ecailles: {
        nom: "Mutagène tégumentaire aléatoire",
        description:
            "Change au hasard la couleur des écailles d'un dragon (jamais blanc, noir, or, ni de mutation esthétique).",
        type: "mutagene_aleatoire",
        cible: "ecailles",
        prix: 800
    },

    teinture_choisie_yeux: {
        nom: "Teinture oculaire choisie",
        description:
            "Choisissez librement la couleur des yeux d'un dragon, y compris l'or, le blanc et le noir.",
        type: "teinture_choisie",
        cible: "yeux",
        prix: 8000
    },

    teinture_choisie_ecailles: {
        nom: "Teinture tégumentaire choisie",
        description:
            "Choisissez librement la couleur des écailles d'un dragon, y compris l'or, le blanc et le noir.",
        type: "teinture_choisie",
        cible: "ecailles",
        prix: 10000
    }

};

function obtenirIdentifiantJoueur() {

    let playerId =
        localStorage.getItem(
            "dragonPlayerId"
        );


    if (!playerId) {

        playerId =
            crypto.randomUUID();


        localStorage.setItem(
            "dragonPlayerId",
            playerId
        );


        console.log(
            "Nouvel identifiant joueur créé :",
            playerId
        );

    }


    return playerId;

}

// =========================================
// SCHÉMA CENTRALISÉ DE LA SAUVEGARDE
// =========================================
//
// Chaque champ persistant du jeu n'est déclaré
// qu'ICI, une seule fois : comment le lire
// (obtenir), comment le restaurer (definir) et
// quelle est sa valeur par défaut si absent
// d'une sauvegarde plus ancienne (defaut).
//
// creerDonneesSauvegarde(), appliquerChampsSauvegarde()
// et reinitialiserChampsSauvegarde() se contentent de
// parcourir cette liste : plus besoin de dupliquer les
// noms de champs à trois endroits différents (c'est ce
// qui rendait ce système fragile).
//
// Pour ajouter un nouveau champ sauvegardé plus tard :
// une seule entrée à ajouter ici, rien d'autre.

const VERSION_SAUVEGARDE_ACTUELLE = 2;

const schemaSauvegarde = [

    {
        cle: "collectionDragons",
        obtenir: () => collectionDragons,
        definir: v => { collectionDragons = v; },
        defaut: () => []
    },

    {
        cle: "succesDebloques",
        obtenir: () => succesDebloques,
        definir: v => { succesDebloques = v; },
        defaut: () => []
    },

    {
        cle: "statistiquesSucces",
        obtenir: () => statistiquesSucces,
        definir: v => { statistiquesSucces = v; },
        defaut: () => ({
            dragonsSauvagesCaptures: 0,
            dragonsEleves: 0
        })
    },

    {
        cle: "actionsRestantes",
        obtenir: () => actionsRestantes,
        definir: v => { actionsRestantes = v; },
        defaut: () => MAX_ACTIONS_PAR_JOUR
    },

    {
        cle: "dateDernierRenouvellement",
        obtenir: () => dateDernierRenouvellement,
        definir: v => { dateDernierRenouvellement = v; },
        defaut: () => null
    },

    {
        cle: "heureDernierRenouvellement",
        obtenir: () => heureDernierRenouvellement,
        definir: v => { heureDernierRenouvellement = v; },
        defaut: () => null
    },

    {
        cle: "piastresDraconiques",
        obtenir: () => piastresDraconiques,
        definir: v => { piastresDraconiques = v; },
        defaut: () => 0
    },

    {
        cle: "inventaireObjets",
        obtenir: () => inventaireObjets,
        definir: v => { inventaireObjets = v; },
        defaut: () => ({})
    },

    {
        cle: "missionsActuelles",
        obtenir: () => missionsActuelles,
        definir: v => { missionsActuelles = v; },
        defaut: () => []
    },

    {
        cle: "dateDernierRenouvellementMissions",
        obtenir: () => dateDernierRenouvellementMissions,
        definir: v => { dateDernierRenouvellementMissions = v; },
        defaut: () => null
    }

];

function creerDonneesSauvegarde() {

    const donnees = {

        versionSauvegarde:
            VERSION_SAUVEGARDE_ACTUELLE,

        dateSauvegarde:
            new Date().toISOString()

    };


    schemaSauvegarde.forEach(
        function (champ) {

            donnees[champ.cle] =
                champ.obtenir();

        }
    );


    return donnees;

}

// Restaure chaque champ du schéma à partir d'une
// sauvegarde donnée (ou de sa valeur par défaut si
// le champ est absent — ex : une sauvegarde créée
// avant l'existence des missions).

function appliquerChampsSauvegarde(sauvegarde) {

    schemaSauvegarde.forEach(
        function (champ) {

            const valeur =
                sauvegarde
                    ? sauvegarde[champ.cle]
                    : undefined;


            champ.definir(
                valeur !== undefined
                    ? valeur
                    : champ.defaut()
            );

        }
    );

}

// Remet chaque champ du schéma à sa valeur par
// défaut (nouvelle partie).

function reinitialiserChampsSauvegarde() {

    schemaSauvegarde.forEach(
        function (champ) {

            champ.definir(
                champ.defaut()
            );

        }
    );

}

// =========================================
// VERROU ANTI-ÉCRASEMENT AU DÉMARRAGE
// =========================================
//
// Tant que la vraie sauvegarde (locale ou distante,
// ou l'état neutre d'une toute nouvelle partie) n'a
// pas fini d'être déterminée, sauvegarderPartie() ne
// doit RIEN persister : sinon on risque d'écraser la
// partie du joueur avec l'état par défaut du script
// (collection vide) — c'est exactement ce qui a causé
// la perte de données du système de missions.
//
// Ce flag passe à true dans appliquerDonneesSauvegarde()
// et dans les branches "nouvelle partie" / recommencerPartie().

let chargementInitialTermine = false;

function sauvegarderPartie() {

    if (!chargementInitialTermine) {

        console.warn(
            "Sauvegarde ignorée : le chargement initial "
            + "n'est pas encore terminé."
        );

        return;

    }


    const donneesSauvegarde =
        creerDonneesSauvegarde();


    const sauvegarde =
        JSON.stringify(
            donneesSauvegarde
        );


    localStorage.setItem(
        "elevageDragons",
        sauvegarde
    );

	afficherEtatSynchronisation(
    "Sauvegarde en cours…",
    "en-cours"
);


    programmerSauvegardeDistante();

}

function programmerSauvegardeDistante() {

    if (minuteurSauvegardeDistante !== null) {

        clearTimeout(
            minuteurSauvegardeDistante
        );

    }


    minuteurSauvegardeDistante =
        setTimeout(
            function () {

                sauvegarderPartieDistante();

                minuteurSauvegardeDistante =
                    null;

            },
            2000
        );

}

async function sauvegarderPartieDistante() {

    // Même verrou que sauvegarderPartie() : c'est cette
    // fonction qui écrit réellement sur le serveur, donc
    // c'est elle qui doit refuser d'agir tant que le
    // chargement initial n'est pas terminé — même si un
    // futur appel venait à la contourner directement.

    if (!chargementInitialTermine) {

        console.warn(
            "Sauvegarde distante ignorée : le chargement "
            + "initial n'est pas encore terminé."
        );

        return;

    }


    try {

        const playerId =
            obtenirIdentifiantJoueur();


        const donnees =
            creerDonneesSauvegarde();


        console.log(
            "Envoi de la sauvegarde distante..."
        );


        const reponse =
            await fetch(
                "/api/sauvegarder",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            playerId: playerId,
                            donnees: donnees
                        })
                }
            );


        const resultat =
            await reponse.json();


        if (
            !reponse.ok
            || !resultat.succes
        ) {

            throw new Error(
                resultat.erreur
                || "Erreur inconnue."
            );

        }


        console.log(
            "SAUVEGARDE DISTANTE RÉUSSIE"
        );
		
		afficherEtatSynchronisation(
    "Sauvegardé en ligne",
    "succes"
);


        return true;

    }

    catch (erreur) {
		
		afficherEtatSynchronisation(
    "Sauvegardé sur cet appareil uniquement",
    "erreur"
);

        console.error(
            "ÉCHEC SAUVEGARDE DISTANTE :",
            erreur
        );


        return false;

    }

}

async function chargerPartieDistante() {

    try {

        const playerId =
            obtenirIdentifiantJoueur();


        console.log(
            "Chargement de la sauvegarde distante..."
        );


        const reponse =
            await fetch(
                "/api/charger",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            playerId: playerId
                        })
                }
            );


        const resultat =
            await reponse.json();


        if (
            !reponse.ok
            || !resultat.succes
        ) {

            throw new Error(
                resultat.erreur
                || "Erreur inconnue."
            );

        }


        appliquerDonneesSauvegarde(
            resultat.donnees
        );


        const sauvegarde =
            JSON.stringify(
                resultat.donnees
            );


        localStorage.setItem(
            "elevageDragons",
            sauvegarde
        );


        console.log(
            "PARTIE DISTANTE CHARGÉE ET APPLIQUÉE"
        );


        return true;

    }

    catch (erreur) {

        console.error(
            "ÉCHEC DU CHARGEMENT DISTANT :",
            erreur
        );


        return false;

    }

}

async function recupererPartieAvecCode(
    codeRecuperation
) {

    try {

        const code =
            codeRecuperation.trim();


        if (code === "") {

            throw new Error(
                "Code de récupération vide."
            );

        }


        console.log(
            "Recherche de la sauvegarde..."
        );


        const reponse =
            await fetch(
                "/api/charger",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            playerId: code
                        })
                }
            );


        const resultat =
            await reponse.json();


        if (
            !reponse.ok
            || !resultat.succes
        ) {

            throw new Error(
                resultat.erreur
                || "Sauvegarde introuvable."
            );

        }


        // Seulement maintenant que la sauvegarde
        // existe réellement, on adopte son identité.

        localStorage.setItem(
            "dragonPlayerId",
            code
        );


        appliquerDonneesSauvegarde(
            resultat.donnees
        );


        localStorage.setItem(
            "elevageDragons",
            JSON.stringify(
                resultat.donnees
            )
        );


        console.log(
            "PARTIE RÉCUPÉRÉE AVEC SUCCÈS"
        );


        return true;

    }

    catch (erreur) {

        console.error(
            "ÉCHEC DE LA RÉCUPÉRATION :",
            erreur
        );


        return false;

    }

}

// =================================
// INTERFACE DE SAUVEGARDE EN LIGNE
// =================================

function mettreAJourInterfaceSauvegarde() {

    const champCode =
        document.getElementById(
            "code-sauvegarde-joueur"
        );


    if (!champCode) {
        return;
    }


    champCode.value =
        obtenirIdentifiantJoueur();

}


async function copierCodeSauvegarde() {

    const code =
        obtenirIdentifiantJoueur();


    try {

        await navigator.clipboard.writeText(
            code
        );


        afficherEtatSynchronisation(
            "Code de récupération copié.",
            "succes"
        );

    }

    catch (erreur) {

        const champCode =
            document.getElementById(
                "code-sauvegarde-joueur"
            );


        champCode.focus();

        champCode.select();


        afficherEtatSynchronisation(
            "Le code a été sélectionné : copie-le manuellement.",
            "erreur"
        );

    }

}


async function gererRecuperationPartie() {

    const champ =
        document.getElementById(
            "champ-code-recuperation"
        );


    const code =
        champ.value.trim();


    if (code === "") {

        afficherEtatSynchronisation(
            "Entre un code de récupération.",
            "erreur"
        );


        return;

    }


    const confirmation =
        confirm(
            "Récupérer cette partie remplacera "
            + "la partie présente sur cet appareil.\n\n"
            + "Continuer ?"
        );


    if (!confirmation) {
        return;
    }


    afficherEtatSynchronisation(
        "Recherche de la partie…",
        "en-cours"
    );


    const succes =
        await recupererPartieAvecCode(
            code
        );


    if (succes) {

        champ.value = "";


        mettreAJourInterfaceSauvegarde();


        afficherEtatSynchronisation(
            "Partie récupérée et sauvegardée sur cet appareil.",
            "succes"
        );

    }

    else {

        afficherEtatSynchronisation(
            "Code invalide ou partie introuvable.",
            "erreur"
        );

    }

}


// =========================================
// SAUVEGARDE MANUELLE (EXPORT / IMPORT)
// =========================================
//
// Contrairement au "code de récupération" (qui n'est
// que l'identifiant du joueur, utile pour retrouver sa
// partie sur le serveur), ceci exporte les VRAIES
// données de jeu, en texte, indépendamment du serveur.
// Un joueur qui garde ce texte quelque part peut se
// remettre d'un incident serveur sans dépendre de rien.

async function exporterSauvegarde() {

    const texte =
        JSON.stringify(
            creerDonneesSauvegarde(),
            null,
            2
        );


    const champImport =
        document.getElementById(
            "champ-import-sauvegarde"
        );


    try {

        await navigator.clipboard.writeText(
            texte
        );


        afficherEtatSynchronisation(
            "Sauvegarde copiée dans le presse-papier.",
            "succes"
        );

    }

    catch (erreur) {

        // Le presse-papier n'est pas disponible :
        // on affiche le texte dans le champ d'import
        // pour que le joueur puisse le sélectionner
        // et le copier lui-même.

        if (champImport) {

            champImport.value = texte;

            champImport.focus();

            champImport.select();

        }


        afficherEtatSynchronisation(
            "Le texte a été placé ci-dessous : copie-le manuellement.",
            "erreur"
        );

    }

}

async function importerSauvegarde() {

    const champ =
        document.getElementById(
            "champ-import-sauvegarde"
        );


    const texte =
        champ.value.trim();


    if (texte === "") {

        afficherEtatSynchronisation(
            "Colle d'abord un texte de sauvegarde.",
            "erreur"
        );

        return;

    }


    let donneesImportees;


    try {

        donneesImportees =
            JSON.parse(texte);

    }

    catch (erreur) {

        afficherEtatSynchronisation(
            "Ce texte n'est pas une sauvegarde valide (JSON illisible).",
            "erreur"
        );

        return;

    }


    // Validation minimale : ça doit ressembler à une
    // sauvegarde de ce jeu, pas à n'importe quel JSON.

    if (
        typeof donneesImportees !== "object"
        || donneesImportees === null
        || Array.isArray(donneesImportees)
        || !Array.isArray(donneesImportees.collectionDragons)
    ) {

        afficherEtatSynchronisation(
            "Ce texte ne ressemble pas à une sauvegarde de Dragon's Ranch.",
            "erreur"
        );

        return;

    }


    const collectionActuelle =
        creerDonneesSauvegarde();


    let messageConfirmation =
        "Importer cette sauvegarde remplacera la partie "
        + "présente sur cet appareil (et sur le serveur).\n\n"
        + "Continuer ?";


    if (
        estSauvegardeSuspecte(
            donneesImportees,
            collectionActuelle
        )
    ) {

        messageConfirmation =
            "Attention : la sauvegarde que tu importes a une "
            + "collection VIDE, alors que ta partie actuelle a "
            + "des dragons. Si ce n'est pas volontaire, annule.\n\n"
            + "Importer quand même ?";

    }


    const confirmation =
        confirm(
            messageConfirmation
        );


    if (!confirmation) {
        return;
    }


    appliquerDonneesSauvegarde(
        donneesImportees
    );


    sauvegarderPartie();


    champ.value = "";


    afficherEtatSynchronisation(
        "Sauvegarde importée et appliquée.",
        "succes"
    );

}

function afficherEtatSynchronisation(
    message,
    etat = ""
) {

    const element =
        document.getElementById(
            "etat-synchronisation"
        );


    if (!element) {

        console.log(
            "État synchronisation :",
            message
        );


        return;

    }


    element.textContent =
        message;


    element.dataset.etat =
        etat;

}

const catalogueSucces = {

    // =========================
    // COLLECTION
    // =========================

    collection_10: {
        nom: "Les débuts d'une ménagerie",
        description:
            "Posséder 10 dragons simultanément.",
        categorie: "collection",
        points: 1
    },


    collection_30: {
        nom: "Une écurie bien remplie",
        description:
            "Posséder 30 dragons simultanément.",
        categorie: "collection",
        points: 1
    },


    collection_50: {
        nom: "Une véritable ménagerie",
        description:
            "Posséder 50 dragons simultanément.",
        categorie: "collection",
        points: 1
    },


    collection_100: {
        nom: "Cent dragons",
        description:
            "Posséder 100 dragons simultanément.",
        categorie: "collection",
        points: 2
    },


    collection_500: {
        nom: "Légion draconique",
        description:
            "Posséder 500 dragons simultanément.",
        categorie: "collection",
        points: 3
    },
	
	// =========================
// CAPTURES SAUVAGES
// =========================

sauvages_10: {
    nom: "Premiers contacts",
    description:
        "Capturer 10 dragons sauvages au total.",
    categorie: "collection",
    points: 1
},

sauvages_30: {
    nom: "Habitué des expéditions",
    description:
        "Capturer 30 dragons sauvages au total.",
    categorie: "collection",
    points: 1
},

sauvages_50: {
    nom: "Chasseur expérimenté",
    description:
        "Capturer 50 dragons sauvages au total.",
    categorie: "collection",
    points: 1
},

sauvages_100: {
    nom: "Maître des terres sauvages",
    description:
        "Capturer 100 dragons sauvages au total.",
    categorie: "collection",
    points: 2
},

sauvages_500: {
    nom: "Légende des expéditions",
    description:
        "Capturer 500 dragons sauvages au total.",
    categorie: "collection",
    points: 3
},


// =========================
// DRAGONS ÉLEVÉS
// =========================

eleves_10: {
    nom: "Premières générations",
    description:
        "Élever 10 dragons au total.",
    categorie: "collection",
    points: 1
},

eleves_30: {
    nom: "L'élevage prospère",
    description:
        "Élever 30 dragons au total.",
    categorie: "collection",
    points: 1
},

eleves_50: {
    nom: "Une lignée florissante",
    description:
        "Élever 50 dragons au total.",
    categorie: "collection",
    points: 1
},

eleves_100: {
    nom: "Cent naissances",
    description:
        "Élever 100 dragons au total.",
    categorie: "collection",
    points: 2
},

eleves_500: {
    nom: "Dynastie draconique",
    description:
        "Élever 500 dragons au total.",
    categorie: "collection",
    points: 3
},

// =========================
// GÉNÉRATIONS
// =========================

generation_1: {
    nom: "Première naissance",
    description:
        "Obtenir un dragon de première génération.",
    categorie: "collection",
    points: 1
},

generation_3: {
    nom: "Une lignée prend forme",
    description:
        "Obtenir un dragon de troisième génération.",
    categorie: "collection",
    points: 1
},

generation_5: {
    nom: "L'héritage des générations",
    description:
        "Obtenir un dragon de cinquième génération.",
    categorie: "collection",
    points: 2
},

generation_10: {
    nom: "Une dynastie",
    description:
        "Obtenir un dragon de dixième génération.",
    categorie: "collection",
    points: 3
},

// =========================
// SÉLECTION GÉNÉTIQUE
// SCORES TOTAUX
// =========================

score_100: {
    nom: "Un spécimen remarquable",
    description:
        "Obtenir un dragon avec un score total d'au moins 100.",
    categorie: "genetique",
    points: 1
},

score_120: {
    nom: "Aux portes de l'excellence",
    description:
        "Obtenir un dragon avec un score total d'au moins 120.",
    categorie: "genetique",
    points: 2
},

score_140: {
    nom: "La perfection",
    description:
        "Obtenir un dragon avec le score maximal de 140.",
    categorie: "genetique",
    points: 3
},

// =========================
// SÉLECTION GÉNÉTIQUE
// POTENTIELS S
// =========================

potentiel_s_1: {
    nom: "Premier potentiel",
    description:
        "Obtenir un dragon possédant au moins 1 potentiel S.",
    categorie: "genetique",
    points: 1
},

potentiel_s_2: {
    nom: "Double potentiel",
    description:
        "Obtenir un dragon possédant au moins 2 potentiels S.",
    categorie: "genetique",
    points: 1
},

potentiel_s_3: {
    nom: "Triple potentiel",
    description:
        "Obtenir un dragon possédant au moins 3 potentiels S.",
    categorie: "genetique",
    points: 1
},

potentiel_s_4: {
    nom: "Potentiel exceptionnel",
    description:
        "Obtenir un dragon possédant au moins 4 potentiels S.",
    categorie: "genetique",
    points: 2
},

potentiel_s_5: {
    nom: "Prodige génétique",
    description:
        "Obtenir un dragon possédant au moins 5 potentiels S.",
    categorie: "genetique",
    points: 2
},

potentiel_s_6: {
    nom: "Aux portes de la perfection",
    description:
        "Obtenir un dragon possédant au moins 6 potentiels S.",
    categorie: "genetique",
    points: 3
},

potentiel_s_7: {
    nom: "Potentiel absolu",
    description:
        "Obtenir un dragon possédant 7 potentiels S.",
    categorie: "genetique",
    points: 3
},

    // =========================
    // ÉLEVAGE ESTHÉTIQUE
    // =========================

    obtenir_dore: {
        nom: "Comme de l'or",
        description:
            "Obtenir un dragon aux écailles dorées.",
        categorie: "esthetique",
        points: 2
    },


    obtenir_iridescent: {
        nom: "Mille reflets",
        description:
            "Obtenir un dragon iridescent.",
        categorie: "esthetique",
        points: 2
    },


    obtenir_albinos: {
        nom: "Blanc comme neige",
        description:
            "Obtenir un dragon albinos.",
        categorie: "esthetique",
        points: 2
    },


    obtenir_heterochrome: {
    nom: "Deux regards",
    description:
        "Obtenir un dragon hétérochrome.",
    categorie: "esthetique",
    points: 2
},


// =========================
// STABILISATION ESTHÉTIQUE
// =========================

stabiliser_dore: {
    nom: "L'or dans le sang",
    description:
        "Obtenir un dragon G5 ou plus aux écailles dorées.",
    categorie: "esthetique",
    points: 3
},

stabiliser_iridescence: {
    nom: "Héritage prismatique",
    description:
        "Obtenir un dragon G5 ou plus iridescent.",
    categorie: "esthetique",
    points: 3
},

stabiliser_albinisme: {
    nom: "Lignée immaculée",
    description:
        "Obtenir un dragon G5 ou plus albinos.",
    categorie: "esthetique",
    points: 3
},

obtenir_opalescence: {
    nom: "Reflets de nacre",
    description:
        "Obtenir un dragon opalescent.",
    categorie: "esthetique",
    points: 2
},

stabiliser_heterochromie: {
    nom: "Deux regards, une lignée",
    description:
        "Obtenir un dragon G5 ou plus hétérochrome.",
    categorie: "esthetique",
    points: 3
},

stabiliser_opalescence: {
    nom: "Héritage de nacre",
    description:
        "Obtenir un dragon opalescent de génération 5.",
    categorie: "esthetique",
    points: 3
},

toutes_especes: {
    nom: "Bestiaire vivant",
    description:
        "Obtenir au moins un dragon de chaque espèce.",
    categorie: "encyclopedie",
    points: 2
},

couple_toutes_especes: {
    nom: "L'Arche des dragons",
    description:
        "Obtenir un mâle et une femelle de chaque espèce.",
    categorie: "encyclopedie",
    points: 3
},

toutes_raretes_toutes_especes: {
    nom: "Encyclopédie chromatique",
    description:
        "Obtenir tous les niveaux de rareté esthétique pour chaque espèce.",
    categorie: "encyclopedie",
    points: 3
},

g5_toutes_especes: {
    nom: "Cinq lignées",
    description:
        "Obtenir un dragon de cinquième génération ou plus pour chaque espèce.",
    categorie: "encyclopedie",
    points: 3
},

dragon_parfait: {
    nom: "Le dragon parfait",
    description:
        "Obtenir un dragon de rareté maximale, avec un score total de 140 et 7 potentiels S.",
    categorie: "divers",
    points: 3
},

dragons_nommes_50: {
    nom: "Chaque dragon a un nom",
    description:
        "Avoir 50 dragons nommés.",
    categorie: "divers",
    points: 2
},

};

const rangsEleveur = [

    {
        nom: "Novice",
        points: 0
    },

    {
        nom: "Éleveur",
        points: 10
    },

    {
        nom: "Maître éleveur",
        points: 25
    },

    {
        nom: "Maître des lignées",
        points: 50
    },

    {
        nom: "Seigneur des dragons",
        points: 80
    },

    {
        nom: "Légende draconique",
        points: 120
    }

];


function calculerPointsSucces() {

    return succesDebloques.reduce(
        function (total, idSucces) {

            const succes =
                catalogueSucces[idSucces];


            if (!succes) {
                return total;
            }


            return total + succes.points;

        },
        0
    );

}


function obtenirProgressionRang(points) {

    let rangActuel =
        rangsEleveur[0];

    let rangSuivant = null;


    for (
        let i = 0;
        i < rangsEleveur.length;
        i++
    ) {

        if (
            points >=
            rangsEleveur[i].points
        ) {

            rangActuel =
                rangsEleveur[i];

        } else {

            rangSuivant =
                rangsEleveur[i];

            break;

        }

    }


    return {

        rangActuel:
            rangActuel,

        rangSuivant:
            rangSuivant

    };

}


function afficherResumeSucces() {

    const zone =
        document.getElementById(
            "resume-succes"
        );


    if (!zone) {
        return;
    }


    const points =
        calculerPointsSucces();


    const progression =
        obtenirProgressionRang(
            points
        );


    const rangActuel =
        progression.rangActuel;


    const rangSuivant =
        progression.rangSuivant;


    let pourcentage = 100;


    if (rangSuivant) {

        const pointsDepuisRang =
            points - rangActuel.points;


        const pointsEntreRangs =
            rangSuivant.points
            - rangActuel.points;


        pourcentage =
            (
                pointsDepuisRang
                / pointsEntreRangs
            ) * 100;

    }


    zone.innerHTML = `

        <div class="carte-prestige">

            <p class="surtitre-prestige">
                Rang actuel
            </p>

            <h3>
                ${rangActuel.nom}
            </h3>

            <p class="score-prestige">
                ${points}
                <span>
                    points de prestige
                </span>
            </p>

            <div class="barre-progression-rang">

                <div
                    class="remplissage-progression-rang"
                    style="width: ${pourcentage}%"
                >
                </div>

            </div>

            <div class="details-progression-rang">

                <span>
                    ${rangActuel.nom}
                </span>

                <span>
                    ${
                        rangSuivant
                        ? rangSuivant.nom
                        : "Rang maximal"
                    }
                </span>

            </div>

            <p class="texte-progression-rang">

                ${
                    rangSuivant

                    ? `
                        Encore
                        ${rangSuivant.points - points}
                        points avant le rang
                        <strong>
                            ${rangSuivant.nom}
                        </strong>.
                    `

                    : `
                        Tu as atteint le rang
                        le plus prestigieux.
                    `
                }

            </p>

        </div>
    `;

}

function afficherListeSucces() {

    const zone =
        document.getElementById(
            "liste-succes"
        );


    if (!zone) {
        return;
    }


    const nomsCategories = {

        collection:
            "Collection",

        progression:
            "Progression",

        statistiques:
            "Statistiques",

        genetique:
            "Génétique",

        esthetique:
            "Élevage esthétique",

        encyclopedie:
            "Encyclopédie",

        divers:
            "Divers"

    };


    let html = "";


    Object.entries(
        nomsCategories
    ).forEach(
        function (
            [idCategorie, nomCategorie]
        ) {

            const succesCategorie =
                Object.entries(
                    catalogueSucces
                ).filter(
                    function (
                        [idSucces, succes]
                    ) {

                        return (
                            succes.categorie
                            === idCategorie
                        );

                    }
                );


            if (
                succesCategorie.length
                === 0
            ) {
                return;
            }


            html += `

                <section class="categorie-succes">

                    <div class="entete-categorie-succes">

                        <h3>
                            ${nomCategorie}
                        </h3>

                        <span>
                            ${
                                succesCategorie.filter(
                                    function (
                                        [idSucces]
                                    ) {

                                        return succesDebloques.includes(
                                            idSucces
                                        );

                                    }
                                ).length
                            }
                            /
                            ${succesCategorie.length}
                        </span>

                    </div>

                    <div class="grille-succes">
            `;


            succesCategorie.forEach(
                function (
                    [idSucces, succes]
                ) {

                    const estDebloque =
                        succesDebloques.includes(
                            idSucces
                        );


                    html += `

                        <article
                            class="
                                carte-succes
                                ${
                                    estDebloque
                                    ? "succes-debloque"
                                    : "succes-verrouille"
                                }
                            "
                        >

                            <div class="icone-etat-succes">

                                ${
                                    estDebloque
                                    ? "◆"
                                    : "◇"
                                }

                            </div>


                            <div class="contenu-succes">

                                <div class="titre-succes">

                                    <h4>
                                        ${succes.nom}
                                    </h4>

                                    <span>
                                        ${succes.points}
                                        ${
                                            succes.points > 1
                                            ? "points"
                                            : "point"
                                        }
                                    </span>

                                </div>


                                <p>
                                    ${succes.description}
                                </p>

                            </div>

                        </article>
                    `;

                }
            );


            html += `

                    </div>

                </section>
            `;

        }
    );


    zone.innerHTML =
        html;

}

function debloquerSucces(idSucces) {

    // Le succès doit exister dans le catalogue.

    if (!catalogueSucces[idSucces]) {

        console.warn(
            "Succès inconnu :",
            idSucces
        );

        return false;
    }


    // Un succès déjà obtenu ne peut pas
    // être débloqué une seconde fois.

    if (
        succesDebloques.includes(
            idSucces
        )
    ) {

        return false;
    }


    // Enregistrement définitif du succès.

    succesDebloques.push(
        idSucces
    );

    incrementerProgressionMission("debloquer_succes");


    sauvegarderPartie();
	afficherResumeSucces();
	afficherListeSucces();


    console.log(
        "SUCCÈS DÉBLOQUÉ :",
        catalogueSucces[idSucces].nom
    );


    return true;
}

function verifierSucces() {

    const dragonsEligiblesSucces =
        collectionDragons.filter(
            function (dragon) {

                return !estDragonUnique(dragon);

            }
        );


    // =========================
    // COLLECTION
    // =========================

    const nombreDragons =
        dragonsEligiblesSucces.length;


    if (nombreDragons >= 10) {
        debloquerSucces("collection_10");
    }

    if (nombreDragons >= 30) {
        debloquerSucces("collection_30");
    }

    if (nombreDragons >= 50) {
        debloquerSucces("collection_50");
    }

    if (nombreDragons >= 100) {
        debloquerSucces("collection_100");
    }

    if (nombreDragons >= 500) {
        debloquerSucces("collection_500");
    }
	
	// =========================
// CAPTURES SAUVAGES
// =========================

const nombreCaptures =
    statistiquesSucces
        .dragonsSauvagesCaptures;

if (nombreCaptures >= 10) {
    debloquerSucces("sauvages_10");
}

if (nombreCaptures >= 30) {
    debloquerSucces("sauvages_30");
}

if (nombreCaptures >= 50) {
    debloquerSucces("sauvages_50");
}

if (nombreCaptures >= 100) {
    debloquerSucces("sauvages_100");
}

if (nombreCaptures >= 500) {
    debloquerSucces("sauvages_500");
}


// =========================
// DRAGONS ÉLEVÉS
// =========================

const nombreEleves =
    statistiquesSucces
        .dragonsEleves;

if (nombreEleves >= 10) {
    debloquerSucces("eleves_10");
}

if (nombreEleves >= 30) {
    debloquerSucces("eleves_30");
}

if (nombreEleves >= 50) {
    debloquerSucces("eleves_50");
}

if (nombreEleves >= 100) {
    debloquerSucces("eleves_100");
}

if (nombreEleves >= 500) {
    debloquerSucces("eleves_500");
}

// =========================
// GÉNÉRATIONS
// =========================

dragonsEligiblesSucces.forEach(
    function (dragon) {

        const generation =
            dragon.generation || 0;


        if (generation >= 1) {

            debloquerSucces(
                "generation_1"
            );

        }


        if (generation >= 3) {

            debloquerSucces(
                "generation_3"
            );

        }


        if (generation >= 5) {

            debloquerSucces(
                "generation_5"
            );

        }


        if (generation >= 10) {

            debloquerSucces(
                "generation_10"
            );

        }

    }
);

// =========================
// SÉLECTION GÉNÉTIQUE
// SCORES TOTAUX
// =========================

dragonsEligiblesSucces.forEach(
    function (dragon) {

        const score =
            calculerScorePerfection(
                dragon
            );


        if (score >= 100) {

            debloquerSucces(
                "score_100"
            );

        }


        if (score >= 120) {

            debloquerSucces(
                "score_120"
            );

        }


        if (score >= 140) {

            debloquerSucces(
                "score_140"
            );

        }

    }
);

// =========================
// SÉLECTION GÉNÉTIQUE
// POTENTIELS S
// =========================

dragonsEligiblesSucces.forEach(
    function (dragon) {

        const nombrePotentielsS =
            Object.values(
                dragon.genes
            ).filter(
                function (genesStatistique) {

                    return (
                        obtenirNoteGenetique(
                            genesStatistique
                        ) === "S"
                    );

                }
            ).length;


        if (nombrePotentielsS >= 1) {
            debloquerSucces("potentiel_s_1");
        }

        if (nombrePotentielsS >= 2) {
            debloquerSucces("potentiel_s_2");
        }

        if (nombrePotentielsS >= 3) {
            debloquerSucces("potentiel_s_3");
        }

        if (nombrePotentielsS >= 4) {
            debloquerSucces("potentiel_s_4");
        }

        if (nombrePotentielsS >= 5) {
            debloquerSucces("potentiel_s_5");
        }

        if (nombrePotentielsS >= 6) {
            debloquerSucces("potentiel_s_6");
        }

        if (nombrePotentielsS >= 7) {
            debloquerSucces("potentiel_s_7");
        }

    }
);


    // =========================
    // ESTHÉTIQUE
    // =========================

    dragonsEligiblesSucces.forEach(
        function (dragon) {

            if (!dragon.apparence) {
                return;
            }


            // Écailles dorées

            if (
                dragon.apparence
                    .familleEcailles
                    === "or"
            ) {

                debloquerSucces(
                    "obtenir_dore"
                );
            }


            // Mutations

            const mutation =
                dragon.apparence
                    .mutationEsthetique;


            if (
                mutation === "iridescence"
            ) {

                debloquerSucces(
                    "obtenir_iridescent"
                );
            }


            if (
                mutation === "albinisme"
            ) {

                debloquerSucces(
                    "obtenir_albinos"
                );
            }

            if (
    mutation === "opalescence"
) {

    debloquerSucces(
        "obtenir_opalescence"
    );
}

            if (
                mutation === "heterochromie"
            ) {

                debloquerSucces(
                    "obtenir_heterochrome"
                );
            }
			
			
			
			// =========================
// STABILISATION ESTHÉTIQUE
// =========================

if (dragon.generation >= 5) {

    // Écailles dorées

    if (
        dragon.apparence
            .familleEcailles
            === "or"
    ) {

        debloquerSucces(
            "stabiliser_dore"
        );
    }


    // Iridescence

    if (
        mutation
            === "iridescence"
    ) {

        debloquerSucces(
            "stabiliser_iridescence"
        );
    }


    // Albinisme

    if (
        mutation
            === "albinisme"
    ) {

        debloquerSucces(
            "stabiliser_albinisme"
        );
    }


    // Hétérochromie

    if (
        mutation
            === "heterochromie"
    ) {

        debloquerSucces(
            "stabiliser_heterochromie"
        );
    }
    
    // Opalescence

if (
    mutation
        === "opalescence"
) {

    debloquerSucces(
        "stabiliser_opalescence"
    );
}

}

        }
    );

// =========================
// ENCYCLOPÉDIE
// TOUTES LES ESPÈCES
// =========================

const toutesLesEspeces =
    Object.keys(profilsEspeces);


const especesPossedees =
    new Set(
        dragonsEligiblesSucces.map(
            dragon => dragon.espece
        )
    );


const possedeToutesLesEspeces =
    toutesLesEspeces.every(
        espece =>
            especesPossedees.has(espece)
    );


if (possedeToutesLesEspeces) {

    debloquerSucces(
        "toutes_especes"
    );

}

// =========================
// ENCYCLOPÉDIE
// UN COUPLE DE CHAQUE ESPÈCE
// =========================

const possedeCoupleChaqueEspece =
    toutesLesEspeces.every(
        function (espece) {

            const possedeMale =
                dragonsEligiblesSucces.some(
                    dragon =>
                        dragon.espece === espece
                        && dragon.sexe === "Mâle"
                );


            const possedeFemelle =
                dragonsEligiblesSucces.some(
                    dragon =>
                        dragon.espece === espece
                        && dragon.sexe === "Femelle"
                );


            return (
                possedeMale
                && possedeFemelle
            );

        }
    );


if (possedeCoupleChaqueEspece) {

    debloquerSucces(
        "couple_toutes_especes"
    );

}

// =========================
// ENCYCLOPÉDIE
// TOUTES LES RARETÉS
// POUR CHAQUE ESPÈCE
// =========================

const niveauxRarete =
    [1, 2, 3, 4, 5];


const possedeToutesLesRaretes =
    toutesLesEspeces.every(
        function (espece) {

            return niveauxRarete.every(
                function (niveau) {

                    return dragonsEligiblesSucces.some(
                        function (dragon) {

                            return (
                                dragon.espece === espece
                                && dragon.rareteEsthetique
                                && dragon.rareteEsthetique.etoiles
                                    === niveau
                            );

                        }
                    );

                }
            );

        }
    );


if (possedeToutesLesRaretes) {

    debloquerSucces(
        "toutes_raretes_toutes_especes"
    );

}

// =========================
// ENCYCLOPÉDIE
// G5 POUR CHAQUE ESPÈCE
// =========================

const possedeG5ChaqueEspece =
    toutesLesEspeces.every(
        function (espece) {

            return dragonsEligiblesSucces.some(
                function (dragon) {

                    return (
                        dragon.espece === espece
                        && dragon.generation >= 5
                    );

                }
            );

        }
    );


if (possedeG5ChaqueEspece) {

    debloquerSucces(
        "g5_toutes_especes"
    );

}

// =========================
// DIVERS
// LE DRAGON PARFAIT
// =========================

const possedeDragonParfait =
    dragonsEligiblesSucces.some(
        function (dragon) {

            const score =
                calculerScorePerfection(
                    dragon
                );


            const nombrePotentielsS =
                Object.values(
                    dragon.genes
                ).filter(
                    function (genesStatistique) {

                        return (
                            obtenirNoteGenetique(
                                genesStatistique
                            ) === "S"
                        );

                    }
                ).length;


            return (
                dragon.rareteEsthetique
                && dragon.rareteEsthetique.etoiles === 5
                && score >= 140
                && nombrePotentielsS === 7
            );

        }
    );


if (possedeDragonParfait) {

    debloquerSucces(
        "dragon_parfait"
    );

}

// =========================
// DIVERS
// 50 DRAGONS NOMMÉS
// =========================

const nombreDragonsNommes =
    dragonsEligiblesSucces.filter(
        function (dragon) {

            return (
                dragon.nom
                && dragon.nom.trim() !== ""
                && dragon.nom !== "Sans nom"
            );

        }
    ).length;


if (nombreDragonsNommes >= 50) {

    debloquerSucces(
        "dragons_nommes_50"
    );

}

}

// =================================
// LECTURE DES DONNÉES DISTANTES
// =================================

async function recupererDonneesDistantes(
    playerId
) {

    const reponse =
        await fetch(
            "/api/charger",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        playerId: playerId
                    })
            }
        );


    const resultat =
        await reponse.json();


    if (
        !reponse.ok
        || !resultat.succes
    ) {

        throw new Error(
            resultat.erreur
            || "Sauvegarde distante introuvable."
        );

    }


    return resultat.donnees;

}


// =================================
// DATE D'UNE SAUVEGARDE
// =================================

function obtenirDateSauvegarde(
    sauvegarde
) {

    if (
        !sauvegarde
        || !sauvegarde.dateSauvegarde
    ) {

        return 0;

    }


    const date =
        new Date(
            sauvegarde.dateSauvegarde
        ).getTime();


    if (Number.isNaN(date)) {

        return 0;

    }


    return date;

}


// =================================
// SYNCHRONISATION AU DÉMARRAGE
// =================================

// =========================================
// GARDE-FOU ANTI-ÉCRASEMENT
// =========================================
//
// Compare une sauvegarde "candidate" (celle qu'on
// s'apprête à appliquer) à une sauvegarde "référence"
// (celle qui est déjà affichée/connue). Si la référence
// a des dragons et que la candidate n'en a aucun, on
// considère la candidate suspecte : ça sent l'état par
// défaut d'un script qui n'a pas fini de charger, ou une
// sauvegarde corrompue — jamais une vraie intention du
// joueur de vider sa propre collection (ça, ça passe par
// "Recommencer", qui lève le verrou explicitement).
//
// C'est un filet de sécurité de dernier recours : même
// si un futur bug fait à nouveau gagner la mauvaise
// sauvegarde à la comparaison de dates, celle-ci ne
// pourra plus jamais écraser silencieusement une
// collection existante par du vide.

function estSauvegardeSuspecte(
    sauvegardeCandidate,
    sauvegardeReference
) {

    if (
        !sauvegardeReference
        || !sauvegardeCandidate
    ) {

        return false;

    }


    const nbReference =
        (sauvegardeReference.collectionDragons || [])
            .length;

    const nbCandidate =
        (sauvegardeCandidate.collectionDragons || [])
            .length;


    return (
        nbReference > 0
        && nbCandidate === 0
    );

}

async function synchroniserPartieAuDemarrage() {

    afficherEtatSynchronisation(
        "Synchronisation…",
        "en-cours"
    );


    let sauvegardeLocale = null;


    const sauvegardeTexte =
        localStorage.getItem(
            "elevageDragons"
        );


    // 1. On affiche immédiatement
    // la sauvegarde locale si elle existe.

    if (sauvegardeTexte !== null) {

        try {

            sauvegardeLocale =
                JSON.parse(
                    sauvegardeTexte
                );


            appliquerDonneesSauvegarde(
                sauvegardeLocale
            );

        }

        catch (erreur) {

            console.error(
                "Sauvegarde locale illisible :",
                erreur
            );

        }

    }


    const playerId =
        obtenirIdentifiantJoueur();


    try {

        // 2. On cherche la sauvegarde
        // correspondant au même joueur.

        const sauvegardeDistante =
            await recupererDonneesDistantes(
                playerId
            );


        const dateLocale =
            obtenirDateSauvegarde(
                sauvegardeLocale
            );


        const dateDistante =
            obtenirDateSauvegarde(
                sauvegardeDistante
            );


        // 3. La sauvegarde locale
        // est strictement plus récente.

        if (
            sauvegardeLocale
            && dateLocale > dateDistante
        ) {

            if (
                estSauvegardeSuspecte(
                    sauvegardeLocale,
                    sauvegardeDistante
                )
            ) {

                // La locale est "plus récente" mais vide,
                // alors que la distante a des dragons :
                // on refuse de faire confiance à la date
                // et on garde la distante à la place.

                console.warn(
                    "Sauvegarde locale suspecte (collection "
                    + "vide alors que la distante en a) : "
                    + "on garde la sauvegarde distante par "
                    + "sécurité."
                );


                appliquerDonneesSauvegarde(
                    sauvegardeDistante
                );


                localStorage.setItem(
                    "elevageDragons",
                    JSON.stringify(
                        sauvegardeDistante
                    )
                );

            }

            else {

                console.log(
                    "Sauvegarde locale plus récente."
                );


                appliquerDonneesSauvegarde(
                    sauvegardeLocale
                );


                await sauvegarderPartieDistante();

            }

        }


        // 4. Sinon, la sauvegarde distante gagne.

        else {

            if (
                estSauvegardeSuspecte(
                    sauvegardeDistante,
                    sauvegardeLocale
                )
            ) {

                // La distante est "plus récente" mais vide,
                // alors que la locale a des dragons : on
                // refuse l'écrasement et on repousse la
                // locale pour corriger le serveur.

                console.warn(
                    "Sauvegarde distante suspecte (collection "
                    + "vide alors que la locale en a) : on "
                    + "garde la sauvegarde locale par "
                    + "sécurité et on la repousse en ligne."
                );


                appliquerDonneesSauvegarde(
                    sauvegardeLocale
                );


                await sauvegarderPartieDistante();

            }

            else {

                console.log(
                    "Sauvegarde distante utilisée."
                );


                appliquerDonneesSauvegarde(
                    sauvegardeDistante
                );


                localStorage.setItem(
                    "elevageDragons",
                    JSON.stringify(
                        sauvegardeDistante
                    )
                );

            }

        }


        afficherEtatSynchronisation(
            "Synchronisé",
            "succes"
        );

    }

    catch (erreur) {

        // Aucun résultat distant :
        // cas normal d'un nouveau joueur.

        if (sauvegardeLocale) {

            console.log(
                "Aucune sauvegarde distante : "
                + "envoi de la sauvegarde locale."
            );


            await sauvegarderPartieDistante();

        }

        else {

            console.log(
                "Nouvelle partie."
            );

            // Nouveau joueur : aucune donnée existante
            // à écraser, on peut lever le verrou et
            // initialiser les missions en toute sécurité.

            chargementInitialTermine = true;

            verifierRenouvellementMissions();

            afficherPiastres();

            afficherMissions();

            afficherBoutique();

            sauvegarderPartie();

        }

    }

}

function appliquerDonneesSauvegarde(
    sauvegarde
) {

    appliquerChampsSauvegarde(
        sauvegarde
    );


    // À partir d'ici, l'état en mémoire reflète une
    // vraie sauvegarde (ou l'état neutre d'une partie
    // qui n'existe pas encore) : sauvegarderPartie()
    // peut désormais persister sans risque.

    chargementInitialTermine = true;


    verifierSucces();

    verifierRenouvellementActions();

    verifierRenouvellementMissions();

    afficherActions();

    afficherCollection();

    afficherParentsDisponibles();

    afficherDragonsEvaluables();

	afficherResumeSucces();

	afficherListeSucces();

    afficherPiastres();

    afficherMissions();

    afficherBoutique();

}

function recommencerPartie() {

    const confirmation = confirm(
        "Veux-tu vraiment recommencer ? Toute ta collection sera supprimée."
    );

    if (confirmation === false) {
        return;
    }


    const confirmationFinale = confirm(
        "Cette action est définitive. Confirmer la suppression de l'élevage ?"
    );

    if (confirmationFinale === false) {
        return;
    }

	// On annule une éventuelle sauvegarde distante
// encore en attente pour l'ancienne partie.

if (minuteurSauvegardeDistante !== null) {

    clearTimeout(
        minuteurSauvegardeDistante
    );

    minuteurSauvegardeDistante = null;

}


// On abandonne l'identité de l'ancienne partie.
// Un nouvel identifiant sera créé automatiquement.

localStorage.removeItem(
    "dragonPlayerId"
);

    localStorage.removeItem("elevageDragons");

    // Repart d'un état neutre pour tous les champs
    // du schéma de sauvegarde, en une seule ligne
    // au lieu d'une réaffectation manuelle par champ.

    reinitialiserChampsSauvegarde();

	dateDernierRenouvellement =
		obtenirDateLocale(new Date());

	// Reset volontaire : il n'y a plus rien à perdre,
	// on peut lever le verrou et sauvegarder à nouveau.

	chargementInitialTermine = true;

	verifierRenouvellementMissions();

	document.getElementById(
    "selection-dragon-evaluation"
).value = "";


document.getElementById(
    "resultat-evaluation"
).innerHTML = "";


document.getElementById(
    "dossier-genetique"
).innerHTML = "";

document.getElementById(
    "fiche-detaillee-dragon"
).innerHTML = "";

document.getElementById(
    "panneau-fiche-dragon"
).classList.remove(
    "ouvert"
);

    document.getElementById("fiche-dragon").innerHTML = `
        <p>Aucun dragon pour le moment.</p>
    `;

    document.getElementById("zone-oeuf").innerHTML = "";

idDragonFicheOuverte = null;
	
	afficherActions();

    dragonActuel = null;

    oeufEnAttente = false;

document.getElementById(
    "bouton-reproduction"
).disabled = false;

    afficherCollection();

    afficherParentsDisponibles();
	
	afficherDragonsEvaluables();
	
	afficherResumeSucces();

	afficherListeSucces();

	afficherPiastres();

	afficherMissions();

	afficherBoutique();

	mettreAJourInterfaceSauvegarde();

	sauvegarderPartie();


}

const profilsEspeces = {

    "Dragon européen": {
        statistiqueFavorite: "taille",
        bonus: 5
    },

    "Vouivre": {
        statistiqueFavorite: "attaque",
        bonus: 5
    },

    "Wyrm": {
        statistiqueFavorite: "defense",
        bonus: 5
    },

    "Dragon oriental": {
        statistiqueFavorite: "magie",
        bonus: 5
    },

    "Hydre": {
        statistiqueFavorite: "endurance",
        bonus: 5
    }


};

// =================================
// SYSTÈME DE RARETÉ ESTHÉTIQUE
// =================================

const couleursParEspece = {

    "Vouivre": {
        repandue: "vert",
        rare: "brun"
    },

    "Dragon européen": {
        repandue: "rouge",
        rare: "vert"
    },

    "Wyrm": {
        repandue: "brun",
        rare: "orange"
    },

    "Dragon oriental": {
        repandue: "bleu",
        rare: "orange"
    },

    "Hydre": {
        repandue: "rouge",
        rare: "bleu"
    }

};

const couleursExceptionnelles = [
    "blanc",
    "noir",
    "or"
];


const rareteYeux = {

    brun: {
        niveau: "commun",
        points: 0
    },

    vert: {
        niveau: "commun",
        points: 0
    },

    bleu: {
        niveau: "commun",
        points: 0
    },

    orange: {
        niveau: "peu commun",
        points: 1
    },

    rouge: {
        niveau: "peu commun",
        points: 1
    },

    blanc: {
        niveau: "rare",
        points: 2
    },

    noir: {
        niveau: "rare",
        points: 2
    },

    or: {
        niveau: "rare",
        points: 2
    }

};

const rareteMutations = {

    heterochromie: {
        nom: "Hétérochromie",
        points: 5
    },

    albinisme: {
        nom: "Albinisme",
        points: 5
    },

    iridescence: {
        nom: "Iridescence",
        points: 5
    },

    opalescence: {
        nom: "Opalescence",
        points: 5
    }

};

function obtenirRareteEcailles(
    espece,
    familleCouleur
) {

    const profil =
        couleursParEspece[espece];


    if (
        couleursExceptionnelles.includes(
            familleCouleur
        )
    ) {

        return {
            niveau: "exceptionnel",
            points: 4
        };

    }


    if (
        familleCouleur
        === profil.rare
    ) {

        return {
            niveau: "rare",
            points: 2
        };

    }


    if (
        familleCouleur
        === profil.repandue
    ) {

        return {
            niveau: "commun",
            points: 0
        };

    }


    return {
        niveau: "inhabituel",
        points: 1
    };
}

function calculerRareteEsthetique(
    espece,
    couleurEcailles,
    couleurYeux,
    mutation = null
) {

    const rareteEcailles =
        obtenirRareteEcailles(
            espece,
            couleurEcailles
        );


    const donneesYeux =
        rareteYeux[couleurYeux];


    let totalPoints =
        rareteEcailles.points
        + donneesYeux.points;


    if (
        mutation !== null
        && rareteMutations[mutation]
    ) {

        totalPoints +=
            rareteMutations[
                mutation
            ].points;

    }


    let etoiles = 1;


    if (totalPoints === 1) {
        etoiles = 2;
    }


    if (
        totalPoints >= 2
        && totalPoints <= 3
    ) {
        etoiles = 3;
    }


    if (totalPoints === 4) {
        etoiles = 4;
    }


    if (totalPoints >= 5) {
        etoiles = 5;
    }


    return {
        points: totalPoints,
        etoiles: etoiles,
        ecailles: rareteEcailles,
        yeux: donneesYeux,
        mutation:
            mutation !== null
                ? rareteMutations[mutation]
                : null
    };
}

// =================================
// DRAGONS UNIQUES
// =================================

function estDragonUnique(dragon) {

    return Boolean(
        dragon
        && dragon.dragonUnique
        && dragon.dragonUnique.id
    );
}


function obtenirTitreDragonUnique(dragon) {

    if (!estDragonUnique(dragon)) {

        return null;

    }


    return dragon.dragonUnique.titre
        || "Unique";
}

function creerChambord() {

    const genes = {

        attaque: [19, 18],

        defense: [20, 19],

        endurance: [18, 18],

        taille: [20, 20],

        intelligence: [19, 18],

        magie: [19, 19],

        vitesse: [18, 17]

    };


    const dragon = {

        id: crypto.randomUUID(),

        nom: "Chambord",

        espece: "Européen",

        sexe: "Mâle",

        origine: "Cadeau",

        generation: 0,

        parents: {

            pere: null,

            mere: null

        },


        dragonUnique: {

            id: "chambord-cadeau-2026",

            titre:
                "Dragon unique distribué à celle qui a su procurer des vacances au développeur"

        },


        genes: genes,


        statistiques: {

            attaque:
                calculerStatistique(
                    genes.attaque
                ),

            defense:
                calculerStatistique(
                    genes.defense
                ),

            endurance:
                calculerStatistique(
                    genes.endurance
                ),

            taille:
                calculerStatistique(
                    genes.taille
                ),

            intelligence:
                calculerStatistique(
                    genes.intelligence
                ),

            magie:
                calculerStatistique(
                    genes.magie
                ),

            vitesse:
                calculerStatistique(
                    genes.vitesse
                )

        },


        apparence: {

            familleEcailles:
                "blanc",

            nuanceEcailles:
                100,

            ecailles:
                "rgb(245, 242, 232)",


            familleYeux:
                "or-mouchete",

            nuanceYeux:
                100,

            yeux:
                "rgb(212, 175, 55)",


            familleSecondOeil:
                null,

            nuanceSecondOeil:
                null,

            secondOeil:
                null,


            mutationEsthetique:
                "dorure-royale"

        }

    };


    dragon.rareteEsthetique = {

        points: 999,

        etoiles: 5,

        ecailles: {

            nom: "Blanche",

            rarete: "Unique"

        },

        yeux: {

            nom: "Or moucheté",

            rarete: "Unique"

        },

        mutation: {

            nom: "Dorure royale",

            rarete: "Unique"

        }

    };


    return dragon;
}

function obtenirNomEcaillesAffiche(dragon) {

    if (
        estDragonUnique(dragon)
        && dragon.rareteEsthetique
        && dragon.rareteEsthetique.ecailles
    ) {

        return dragon
            .rareteEsthetique
            .ecailles
            .nom;

    }


    return formaterNomCouleur(
        dragon.apparence.familleEcailles
    );
}


function obtenirNomYeuxAffiche(dragon) {

    if (
        estDragonUnique(dragon)
        && dragon.rareteEsthetique
        && dragon.rareteEsthetique.yeux
    ) {

        return dragon
            .rareteEsthetique
            .yeux
            .nom;

    }


    return formaterNomCouleur(
        dragon.apparence.familleYeux
    );
}


function formaterNomCouleur(couleur) {

    return couleur.charAt(0).toUpperCase()
        + couleur.slice(1);
}

function obtenirClassePastilleEcailles(dragon) {

    if (
        !dragon
        || !dragon.apparence
    ) {

        return "";

    }


    if (
        dragon.apparence.mutationEsthetique
            === "iridescence"
    ) {

        return "pastille-iridescente";

    }


    if (
        dragon.apparence.mutationEsthetique
            === "opalescence"
    ) {

        return "pastille-opalescente";

    }


    return "";
}

function genererAffichageYeux(dragon) {

    if (
        dragon
        && dragon.apparence
        && dragon.apparence.mutationEsthetique
            === "heterochromie"
        && dragon.apparence.secondOeil
    ) {

        return `
            <span class="groupe-pastilles-yeux">

                <span
                    class="pastille-couleur"
                    style="background-color:
                        ${dragon.apparence.yeux};"
                ></span>

                <span
                    class="pastille-couleur"
                    style="background-color:
                        ${dragon.apparence.secondOeil};"
                ></span>

            </span>
        `;

    }


    return `
        <span class="groupe-pastilles-yeux">

            <span
                class="pastille-couleur"
                style="background-color:
                    ${dragon.apparence.yeux};"
            ></span>

        </span>
    `;
}

function genererEtoiles(nombre) {

    return (
        "★".repeat(nombre)
        +
        "☆".repeat(5 - nombre)
    );
}

function obtenirLibelleRarete(etoiles) {

    const libelles = {
        1: "Commune",
        2: "Peu commune",
        3: "Rare",
        4: "Très rare",
        5: "Exceptionnelle"
    };


    return libelles[etoiles];
}



const palettesCouleurs = {

    vert: {
        debut: [150, 210, 100],
        fin: [20, 70, 35]
    },

    rouge: {
        debut: [240, 90, 110],
        fin: [90, 35, 120]
    },

    bleu: {
        debut: [120, 200, 240],
        fin: [15, 35, 100]
    },

    brun: {
        debut: [175, 125, 75],
        fin: [90, 55, 30]
    },

    orange: {
        debut: [245, 215, 70],
        fin: [220, 90, 25]
    },

    blanc: {
        debut: [255, 255, 255],
        fin: [210, 215, 220]
    },

    noir: {
        debut: [70, 70, 75],
        fin: [10, 10, 15]
    },

    or: {
        debut: [255, 225, 110],
        fin: [175, 120, 20]
    }

};

function convertirCouleurEnRgb(
    famille,
    nuance
) {

    const palette =
        palettesCouleurs[famille];


    const progression =
        nuance / 100;


    const rouge = Math.round(
        palette.debut[0]
        +
        (
            palette.fin[0]
            - palette.debut[0]
        )
        * progression
    );


    const vert = Math.round(
        palette.debut[1]
        +
        (
            palette.fin[1]
            - palette.debut[1]
        )
        * progression
    );


    const bleu = Math.round(
        palette.debut[2]
        +
        (
            palette.fin[2]
            - palette.debut[2]
        )
        * progression
    );


    return `rgb(${rouge}, ${vert}, ${bleu})`;
}

function genererFamilleEcaillesSauvage(
    espece
) {

    const profil =
        couleursParEspece[espece];


    const tirage =
        nombreAleatoire(1, 1000);


    // 84 % — couleur répandue

    if (tirage <= 840) {

        return profil.repandue;

    }


    // 15 % — couleur rare de l'espèce

    if (tirage <= 990) {

        return profil.rare;

    }


    // 1 % — couleur exceptionnelle

    return choisirAuHasard(
        couleursExceptionnelles
    );
}

function genererFamilleYeux() {

    const tirage =
        nombreAleatoire(1, 1000);


    // 75 % — couleurs communes

    if (tirage <= 750) {

        return choisirAuHasard([
            "brun",
            "vert",
            "bleu"
        ]);

    }


    // 20 % — couleurs peu communes

    if (tirage <= 950) {

        return choisirAuHasard([
            "orange",
            "rouge"
        ]);

    }


    // 5 % — couleurs rares

    return choisirAuHasard([
        "blanc",
        "noir",
        "or"
    ]);
}

function genererApparenceSauvage(espece) {

    const familleEcailles =
    genererFamilleEcaillesSauvage(
        espece
    );


	const familleYeux =
    genererFamilleYeux();


    const nuanceEcailles =
        nombreAleatoire(1, 100);


    const nuanceYeux =
        nombreAleatoire(1, 100);


    let couleurEcaillesVisible =
        convertirCouleurEnRgb(
            familleEcailles,
            nuanceEcailles
        );


    let couleurYeuxVisible =
        convertirCouleurEnRgb(
            familleYeux,
            nuanceYeux
        );


    // =========================
    // MUTATION ESTHÉTIQUE
    // =========================

    const mutationsPossibles = [
        "albinisme",
        "iridescence",
        "heterochromie",
        "opalescence"
    ];


    const mutationsReussies = [];


    mutationsPossibles.forEach(
        function (mutation) {

            const tirage =
                nombreAleatoire(1, 1000);


            if (tirage <= 5) {

                mutationsReussies.push(
                    mutation
                );

            }

        }
    );


    const mutationEsthetique =
        mutationsReussies.length > 0

            ? choisirAuHasard(
                mutationsReussies
            )

            : null;


    // =========================
    // ALBINISME
    // =========================

    if (
        mutationEsthetique
            === "albinisme"
    ) {

        couleurEcaillesVisible =
            "rgb(242, 235, 220)";

        couleurYeuxVisible =
            "rgb(185, 45, 55)";

    }


    // =========================
    // IRIDESCENCE
    // =========================

    if (
        mutationEsthetique
            === "iridescence"
    ) {

        couleurEcaillesVisible =
            "rgb(175, 205, 210)";

    }


    // =========================
    // HÉTÉROCHROMIE
    // =========================

    let secondOeilHeterochromie =
        null;


    if (
        mutationEsthetique
            === "heterochromie"
    ) {

        secondOeilHeterochromie =
            genererSecondOeilHeterochromie(
                familleYeux
            );

    }


    return {

        familleEcailles:
            familleEcailles,

        nuanceEcailles:
            nuanceEcailles,

        ecailles:
            couleurEcaillesVisible,

        familleYeux:
            familleYeux,

        nuanceYeux:
            nuanceYeux,

        yeux:
            couleurYeuxVisible,

        familleSecondOeil:
            secondOeilHeterochromie
                ? secondOeilHeterochromie
                    .familleSecondOeil
                : null,

        nuanceSecondOeil:
            secondOeilHeterochromie
                ? secondOeilHeterochromie
                    .nuanceSecondOeil
                : null,

        secondOeil:
            secondOeilHeterochromie
                ? secondOeilHeterochromie
                    .secondOeil
                : null,

        mutationEsthetique:
            mutationEsthetique

    };
}


function genererGeneSauvage(
    espece,
    nomStatistique
) {

    const jet1 =
        nombreAleatoire(1, 20);

    const jet2 =
        nombreAleatoire(1, 20);


    let gene = Math.round(
        (jet1 + jet2) / 2
    );


    const profil =
        profilsEspeces[espece];


    if (
        nomStatistique ===
        profil.statistiqueFavorite
    ) {

        gene += profil.bonus;

    }


    return Math.min(
        20,
        gene
    );
}


function calculerStatistique(genes) {

    return Math.round(
        (genes[0] + genes[1]) / 2
    );
}

function calculerScorePerfection(dragon) {

    const statistiques =
        dragon.statistiques;


    return (
        statistiques.attaque
        + statistiques.defense
        + statistiques.endurance
        + statistiques.taille
        + statistiques.intelligence
        + statistiques.magie
        + statistiques.vitesse
    );
}


function calculerPourcentagePerfection(dragon) {

    const score =
        calculerScorePerfection(dragon);


    return (
        (score / 140) * 100
    ).toFixed(1);
}

let dragonActuel = null;

function creerDragonAleatoire() {

    const especes = [
        "Vouivre",
        "Hydre",
        "Dragon oriental",
        "Dragon européen",
        "Wyrm"
    ];

    const sexes = [
        "Mâle",
        "Femelle"
    ];

const especeChoisie =
    choisirAuHasard(especes);

const genes = {

    attaque: [
        genererGeneSauvage(
            especeChoisie,
            "attaque"
        ),

        genererGeneSauvage(
            especeChoisie,
            "attaque"
        )
    ],


    defense: [
        genererGeneSauvage(
            especeChoisie,
            "defense"
        ),

        genererGeneSauvage(
            especeChoisie,
            "defense"
        )
    ],


    endurance: [
        genererGeneSauvage(
            especeChoisie,
            "endurance"
        ),

        genererGeneSauvage(
            especeChoisie,
            "endurance"
        )
    ],


    taille: [
        genererGeneSauvage(
            especeChoisie,
            "taille"
        ),

        genererGeneSauvage(
            especeChoisie,
            "taille"
        )
    ],


    intelligence: [
        genererGeneSauvage(
            especeChoisie,
            "intelligence"
        ),

        genererGeneSauvage(
            especeChoisie,
            "intelligence"
        )
    ],


    magie: [
        genererGeneSauvage(
            especeChoisie,
            "magie"
        ),

        genererGeneSauvage(
            especeChoisie,
            "magie"
        )
    ],


    vitesse: [
        genererGeneSauvage(
            especeChoisie,
            "vitesse"
        ),

        genererGeneSauvage(
            especeChoisie,
            "vitesse"
        )
    ]

};

    const dragon = {
        id: crypto.randomUUID(),

        nom: "Sans nom",

        espece: especeChoisie,

        sexe: choisirAuHasard(sexes),
    
        origine: "Sauvage",

        generation: 0,

        parents: {
            pere: null,
            mere: null
    },

        genes: genes,

        statistiques: {

    attaque:
        calculerStatistique(
            genes.attaque
        ),

    defense:
        calculerStatistique(
            genes.defense
        ),

    endurance:
        calculerStatistique(
            genes.endurance
        ),

    taille:
        calculerStatistique(
            genes.taille
        ),

    intelligence:
        calculerStatistique(
            genes.intelligence
        ),

    magie:
        calculerStatistique(
            genes.magie
        ),

    vitesse:
        calculerStatistique(
            genes.vitesse
        )

},
         apparence:
    genererApparenceSauvage(
        especeChoisie
    )
    };
	
	dragon.rareteEsthetique =
    calculerRareteEsthetique(
        dragon.espece,
        dragon.apparence.familleEcailles,
        dragon.apparence.familleYeux,
        dragon.apparence.mutationEsthetique
    );

    console.log(
        "Dragon sauvage :",
        dragon.espece,
        dragon.genes,
        dragon.statistiques
    );


    return dragon;
}


function nombreAleatoire(minimum, maximum) {

    return Math.floor(
        Math.random() * (maximum - minimum + 1)
    ) + minimum;
}

function choisirAuHasard(liste) {

    const position = nombreAleatoire(0, liste.length - 1);

    return liste[position];
}

function obtenirDateLocale(date) {
    return (
        date.getFullYear()
        + "-"
        + String(date.getMonth() + 1).padStart(2, "0")
        + "-"
        + String(date.getDate()).padStart(2, "0")
    );
}

function obtenirHeureLocale(date) {
    const heurePile = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        0,
        0,
        0
    );

    return heurePile.toISOString();
}

function verifierRenouvellementActions() {
    const maintenant = new Date();

    const dateAujourdhui =
        obtenirDateLocale(maintenant);

    const heureActuelle =
        obtenirHeureLocale(maintenant);

    if (dateDernierRenouvellement !== dateAujourdhui) {
        actionsRestantes = MAX_ACTIONS_PAR_JOUR;
        dateDernierRenouvellement = dateAujourdhui;
        heureDernierRenouvellement = heureActuelle;

        sauvegarderPartie();
        return;
    }

    if (heureDernierRenouvellement === null) {
        heureDernierRenouvellement = heureActuelle;
        sauvegarderPartie();
        return;
    }

    const derniereHeure =
        new Date(heureDernierRenouvellement);

    const differenceMs =
        maintenant.getTime() - derniereHeure.getTime();

    const heuresPassees =
        Math.floor(differenceMs / (1000 * 60 * 60));

    if (
        heuresPassees > 0
        && actionsRestantes < MAX_ACTIONS_PAR_JOUR
    ) {
        actionsRestantes = Math.min(
            MAX_ACTIONS_PAR_JOUR,
            actionsRestantes + heuresPassees
        );

        const nouvelleHeure =
            new Date(
                derniereHeure.getTime()
                + heuresPassees * 60 * 60 * 1000
            );

        heureDernierRenouvellement =
            nouvelleHeure.toISOString();

        sauvegarderPartie();
    }
}

// =========================================
// MISSIONS QUOTIDIENNES
// =========================================

function tirerMissionsDuJour() {

    // Une mission garantie par palier de difficulté, pour
    // que chaque journée propose toujours un mélange
    // facile / intermédiaire / difficile plutôt qu'un
    // tirage entièrement aléatoire pouvant, par malchance,
    // ne donner que des missions du même palier.

    const paliers =
        ["facile", "intermediaire", "difficile"];


    const idsChoisis = [];


    paliers.forEach(
        function (palier) {

            const idsDuPalier =
                Object.keys(catalogueMissions).filter(
                    function (id) {

                        return (
                            catalogueMissions[id].difficulte
                                === palier
                        );

                    }
                );


            if (idsDuPalier.length === 0) {
                return;
            }


            const idTire =
                choisirAuHasard(
                    idsDuPalier
                );

            idsChoisis.push(idTire);

        }
    );


    // S'il reste des emplacements à pourvoir (par exemple
    // si NOMBRE_MISSIONS_PAR_JOUR dépasse le nombre de
    // paliers), on complète au hasard parmi les missions
    // non encore choisies.

    const idsRestants =
        Object.keys(catalogueMissions).filter(
            function (id) {

                return !idsChoisis.includes(id);

            }
        );


    while (
        idsChoisis.length
            < Math.min(
                NOMBRE_MISSIONS_PAR_JOUR,
                idsChoisis.length + idsRestants.length
            )
    ) {

        const idTire =
            choisirAuHasard(
                idsRestants
            );


        if (!idsChoisis.includes(idTire)) {

            idsChoisis.push(idTire);

        }

    }


    return idsChoisis.map(
        function (id) {

            return {

                id: id,

                progression: 0,

                reclamee: false

            };

        }
    );

}

function verifierRenouvellementMissions() {

    const dateAujourdhui =
        obtenirDateLocale(
            new Date()
        );


    if (
        dateDernierRenouvellementMissions
            !== dateAujourdhui
    ) {

        missionsActuelles =
            tirerMissionsDuJour();

        dateDernierRenouvellementMissions =
            dateAujourdhui;


        sauvegarderPartie();

        afficherMissions();

    }

}

function incrementerProgressionMission(
    idType,
    quantite = 1
) {

    const mission =
        missionsActuelles.find(
            function (m) {

                return (
                    m.id === idType
                    && m.reclamee === false
                );

            }
        );


    if (!mission) {

        return;

    }


    const definition =
        catalogueMissions[idType];


    mission.progression =
        Math.min(
            definition.objectif,
            mission.progression + quantite
        );


    afficherMissions();

}

// Nombre de statistiques dont le meilleur gène atteint
// le rang génétique S (≥ 19) — le "potentiel" caché du
// dragon, indépendant du fait qu'il ait été évalué ou non.

function compterPotentielS(dragon) {

    if (!dragon || !dragon.genes) {

        return 0;

    }


    const statistiques = [
        "attaque",
        "defense",
        "endurance",
        "taille",
        "intelligence",
        "magie",
        "vitesse"
    ];


    return statistiques.filter(
        function (statistique) {

            return (
                dragon.genes[statistique]
                && obtenirNoteGenetique(
                    dragon.genes[statistique]
                ) === "S"
            );

        }
    ).length;

}

// Retrouve la clé de mission associée à une espèce
// (utilisée pour les missions "Attraper un(e) <espèce>...").

function obtenirCleEspecePourMissions(nomEspece) {

    const trouvee =
        especesPourMissions.find(
            function (espece) {

                return espece.nom === nomEspece;

            }
        );


    return trouvee ? trouvee.cle : null;

}

// "origine" vaut "capture" (dragon sauvage gardé) ou
// "reproduction" (bébé gardé après une éclosion) : ça
// permet de distinguer les missions qui ne comptent que
// dans un sens ou dans l'autre.

function signalerDragonObtenu(dragon, origine) {

    if (!dragon || !dragon.apparence) {

        return;

    }


    // --- Rareté des écailles seules (mission existante) ---

    const rarete =
        obtenirRareteEcailles(
            dragon.espece,
            dragon.apparence.familleEcailles
        );


    if (
        rarete.niveau === "rare"
        || rarete.niveau === "exceptionnel"
    ) {

        incrementerProgressionMission(
            "obtenir_ecailles_rares"
        );

    }


    // --- Score de perfection (en % et en valeur brute) ---

    const perfection =
        parseFloat(
            calculerPourcentagePerfection(
                dragon
            )
        );


    if (perfection >= 60) {

        incrementerProgressionMission(
            "obtenir_dragon_parfait"
        );

    }


    const scoreBrut =
        calculerScorePerfection(dragon);


    if (scoreBrut > 100) {

        incrementerProgressionMission(
            "score_brut_100"
        );

    }


    // --- Potentiel génétique (nombre de statistiques S) ---

    const nombreS =
        compterPotentielS(dragon);


    if (nombreS >= 3) {

        incrementerProgressionMission(
            "potentiel_3s"
        );

    }


    if (nombreS >= 5) {

        incrementerProgressionMission(
            "potentiel_5s"
        );

    }


    // --- Rareté globale (étoiles), croisée avec l'origine ---

    const etoiles =
        dragon.rareteEsthetique
            ? dragon.rareteEsthetique.etoiles
            : 0;


    if (origine === "capture" && etoiles >= 2) {

        incrementerProgressionMission(
            "capturer_peu_commun"
        );

    }


    if (origine === "capture" && etoiles >= 3) {

        incrementerProgressionMission(
            "dragon_rare_capture"
        );

    }


    if (origine === "reproduction" && etoiles >= 3) {

        incrementerProgressionMission(
            "dragon_rare_reproduction"
        );

    }


    if (origine === "capture" && etoiles >= 5) {

        incrementerProgressionMission(
            "dragon_exceptionnel_capture"
        );

    }


    if (origine === "reproduction" && etoiles >= 5) {

        incrementerProgressionMission(
            "dragon_exceptionnel_reproduction"
        );

    }


    // --- Missions déclinées par espèce (capture uniquement) ---

    if (origine === "capture") {

        const cleEspece =
            obtenirCleEspecePourMissions(
                dragon.espece
            );


        if (cleEspece) {

            if (etoiles >= 2) {

                incrementerProgressionMission(
                    `capturer_${cleEspece}_peu_commun`
                );

            }


            if (etoiles >= 3) {

                incrementerProgressionMission(
                    `capturer_${cleEspece}_rare`
                );

            }

        }

    }

}

function reclamerMission(idMission) {

    const mission =
        missionsActuelles.find(
            function (m) {

                return m.id === idMission;

            }
        );


    if (!mission || mission.reclamee) {

        return;

    }


    const definition =
        catalogueMissions[idMission];


    if (mission.progression < definition.objectif) {

        return;

    }


    mission.reclamee = true;

    piastresDraconiques +=
        definition.recompense;


    sauvegarderPartie();

    afficherMissions();

    afficherPiastres();

}

function afficherMissions() {

    const conteneur =
        document.getElementById(
            "liste-missions"
        );


    if (!conteneur) {

        return;

    }


    if (missionsActuelles.length === 0) {

        conteneur.innerHTML = `
            <p>Aucune mission pour le moment.</p>
        `;

        return;

    }


    conteneur.innerHTML =
        missionsActuelles.map(
            function (mission) {

                const definition =
                    catalogueMissions[mission.id];


                if (!definition) {

                    return "";

                }


                const complete =
                    mission.progression
                        >= definition.objectif;


                return `
                    <div class="carte-mission ${
                        mission.reclamee
                            ? "reclamee"
                            : complete
                                ? "complete"
                                : ""
                    }">

                        <div class="entete-mission">

                            <span class="difficulte-mission difficulte-${
                                definition.difficulte
                            }">
                                ${
                                    libellesDifficulteMissions[
                                        definition.difficulte
                                    ] || definition.difficulte
                                }
                            </span>

                            <span class="recompense-mission">
                                ${definition.recompense} piastres
                            </span>

                        </div>

                        <p class="libelle-mission">
                            ${definition.libelle}
                        </p>

                        <div class="progression-mission">
                            <div class="barre-progression-mission">
                                <div
                                    class="remplissage-progression-mission"
                                    style="width: ${
                                        Math.min(
                                            100,
                                            (mission.progression
                                                / definition.objectif)
                                                * 100
                                        )
                                    }%;"
                                ></div>
                            </div>

                            <span class="texte-progression-mission">
                                ${mission.progression} / ${definition.objectif}
                            </span>
                        </div>

                        <button
                            class="bouton-reclamer-mission"
                            ${
                                complete && !mission.reclamee
                                    ? ""
                                    : "disabled"
                            }
                            onclick="reclamerMission('${mission.id}')"
                        >
                            ${
                                mission.reclamee
                                    ? "Récompense obtenue"
                                    : "Réclamer"
                            }
                        </button>

                    </div>
                `;

            }
        ).join("");

}

function afficherPiastres() {

    const zone =
        document.getElementById(
            "solde-piastres"
        );


    if (!zone) {

        return;

    }


    zone.textContent =
        `${piastresDraconiques} piastres draconiques`;

}

// =========================================
// BOUTIQUE
// =========================================

function acheterObjet(idObjet) {

    const objet =
        catalogueBoutique[idObjet];


    if (!objet) {

        return;

    }


    if (piastresDraconiques < objet.prix) {

        alert(
            "Tu n'as pas assez de piastres draconiques."
        );

        return;

    }


    piastresDraconiques -= objet.prix;

    inventaireObjets[idObjet] =
        (inventaireObjets[idObjet] || 0) + 1;


    sauvegarderPartie();

    afficherPiastres();

    afficherBoutique();


    if (idDragonFicheOuverte !== null) {

        const dragon =
            collectionDragons.find(
                function (d) {

                    return d.id === idDragonFicheOuverte;

                }
            );


        if (dragon) {

            afficherFicheDetaillee(dragon);

        }

    }

}

function afficherBoutique() {

    const conteneur =
        document.getElementById(
            "liste-boutique"
        );


    if (!conteneur) {

        return;

    }


    conteneur.innerHTML =
        Object.keys(catalogueBoutique).map(
            function (idObjet) {

                const objet =
                    catalogueBoutique[idObjet];


                const possede =
                    inventaireObjets[idObjet] || 0;


                return `
                    <div class="carte-objet-boutique">

                        <h3>${objet.nom}</h3>

                        <p class="description-objet">
                            ${objet.description}
                        </p>

                        <div class="pied-objet-boutique">

                            <span class="prix-objet">
                                ${objet.prix} piastres
                            </span>

                            <span class="possede-objet">
                                Possédé(s) : ${possede}
                            </span>

                        </div>

                        <button
                            class="bouton-acheter-objet"
                            ${
                                piastresDraconiques
                                    < objet.prix
                                    ? "disabled"
                                    : ""
                            }
                            onclick="acheterObjet('${idObjet}')"
                        >
                            Acheter
                        </button>

                    </div>
                `;

            }
        ).join("");

}

function afficherActions() {

    const zoneSymboles =
        document.getElementById(
            "symboles-actions"
        );

    const texteActions =
        document.getElementById(
            "texte-actions"
        );


    zoneSymboles.innerHTML = "";


    for (
        let i = 1;
        i <= MAX_ACTIONS_PAR_JOUR;
        i++
    ) {

        const symbole =
            document.createElement(
                "span"
            );


        symbole.classList.add(
            "symbole-action"
        );


        if (i <= actionsRestantes) {

            symbole.classList.add(
                "disponible"
            );

            symbole.textContent = "◆";

        } else {

            symbole.classList.add(
                "depensee"
            );

            symbole.textContent = "◇";

        }


        zoneSymboles.appendChild(
            symbole
        );

    }


    texteActions.textContent =
        `${actionsRestantes} / ${MAX_ACTIONS_PAR_JOUR}`;
	
	mettreAJourBoutonsActions();
}

function mettreAJourBoutonsActions() {

    const aucuneAction =
        actionsRestantes <= 0;


    document.getElementById(
        "bouton-generation"
    ).disabled = aucuneAction;


    document.getElementById(
        "bouton-evaluation"
    ).disabled = aucuneAction;


    document.getElementById(
        "bouton-reproduction"
    ).disabled =
        aucuneAction
        || oeufEnAttente;

}

function depenserAction() {

    if (actionsRestantes <= 0) {

        return false;

    }


    actionsRestantes--;

    incrementerProgressionMission("epuiser_actions");


    afficherActions();

    sauvegarderPartie();


    return true;
}

function afficherDragonsSauvages() {

    const fiche =
        document.getElementById("fiche-dragon");


    fiche.innerHTML = `
        <h2>Dragons sauvages rencontrés</h2>

        <p>
            Tu peux choisir un seul de ces trois dragons.
        </p>

        <div class="liste-dragons-sauvages">

            ${dragonsSauvagesActuels.map(
                function (dragon, index) {

                    return `
                        <div class="candidat-sauvage">

                            <h3>
                                Dragon ${index + 1}
                            </h3>

                            <p>
                                <strong>Espèce :</strong>
                                ${dragon.espece}
                            </p>

                            <p>
                                <strong>Sexe :</strong>
                                ${dragon.sexe}
                            </p>

                            <h4>Statistiques</h4>

                            <p>Attaque : ${dragon.statistiques.attaque}</p>
                            <p>Défense : ${dragon.statistiques.defense}</p>
                            <p>Endurance : ${dragon.statistiques.endurance}</p>
                            <p>Taille : ${dragon.statistiques.taille}</p>
                            <p>Intelligence : ${dragon.statistiques.intelligence}</p>
                            <p>Magie : ${dragon.statistiques.magie}</p>
                            <p>Vitesse : ${dragon.statistiques.vitesse}</p>

                            <h4>Apparence</h4>

                            <p>
    Écailles :

    <span
        class="pastille-couleur ${obtenirClassePastilleEcailles(dragon)}"
        style="background-color: ${dragon.apparence.ecailles};"
    ></span>

    Yeux :

    ${genererAffichageYeux(dragon)}
</p>
							
						<div class="rarete-esthetique-expedition">

    <span class="etoiles-rarete">
        ${genererEtoiles(
            dragon.rareteEsthetique.etoiles
        )}
    </span>

    <strong>
        ${obtenirLibelleRarete(
            dragon.rareteEsthetique.etoiles
        )}
    </strong>

</div>
							
                            <input
                                type="text"
                                id="nom-dragon-${index}"
                                placeholder="Nom du dragon"
                                maxlength="20"
                            >

                            <button
                                class="bouton-choisir-sauvage"
                                data-index="${index}"
                            >
                                Choisir ce dragon
                            </button>

                        </div>
                    `;
                }
            ).join("")}

        </div>
    `;


    const boutons =
        document.querySelectorAll(
            ".bouton-choisir-sauvage"
        );


    boutons.forEach(function (bouton) {

        bouton.addEventListener(
            "click",
            function () {

                const index =
                    Number(bouton.dataset.index);

                garderDragon(index);

            }
        );

    });
}

function garderDragon(index) {

    const champNom =
        document.getElementById(
            `nom-dragon-${index}`
        );

    const nomChoisi =
        champNom.value.trim();


    if (nomChoisi === "") {

        alert(
            "Tu dois donner un nom à ton dragon."
        );

        return;
    }


    const dragonChoisi =
        dragonsSauvagesActuels[index];


    dragonChoisi.nom = nomChoisi;


    collectionDragons.push(dragonChoisi);

	statistiquesSucces.dragonsSauvagesCaptures++;
	sauvegarderPartie();

	verifierSucces();

    incrementerProgressionMission("capturer_dragons");

    signalerDragonObtenu(dragonChoisi, "capture");

    sauvegarderPartie();


    dragonsSauvagesActuels = [];


    afficherCollection();

    afficherParentsDisponibles();
	
	afficherDragonsEvaluables();


    const fiche =
        document.getElementById("fiche-dragon");


    fiche.innerHTML = `
        <p>
            ${dragonChoisi.nom} a rejoint ton élevage !
        </p>

        <p>
            Les deux autres dragons sauvages sont repartis.
        </p>
    `;
}

function obtenirNoteGenetique(genes) {

    const meilleurGene =
        Math.max(...genes);


    if (meilleurGene >= 19) {
        return "S";
    }

    if (meilleurGene >= 16) {
        return "A";
    }

    if (meilleurGene >= 13) {
        return "B";
    }

    if (meilleurGene >= 10) {
        return "C";
    }

    if (meilleurGene >= 7) {
        return "D";
    }

    if (meilleurGene >= 4) {
        return "E";
    }

    return "F";
}

function afficherDossierGenetique(dragon) {

    const dossier =
        document.getElementById(
            "dossier-genetique"
        );


    if (!dragon) {

        dossier.innerHTML = "";

        return;
    }


    const evaluations =
        dragon.evaluations || {};


    const statistiques = [
        {
            cle: "attaque",
            nom: "Attaque"
        },
        {
            cle: "defense",
            nom: "Défense"
        },
        {
            cle: "endurance",
            nom: "Endurance"
        },
        {
            cle: "taille",
            nom: "Taille"
        },
        {
            cle: "intelligence",
            nom: "Intelligence"
        },
        {
            cle: "magie",
            nom: "Magie"
        },
        {
            cle: "vitesse",
            nom: "Vitesse"
        }
    ];


    const lignesDossier =
        statistiques.map(
            function (statistique) {

                const note =
                    evaluations[
                        statistique.cle
                    ] || "?";


                const classeNote =
                    note === "?"
                        ? "note-inconnue"
                        : `note-${note.toLowerCase()}`;


                return `
                    <div
                        class="ligne-dossier-genetique"
                    >

                        <span
                            class="nom-statistique-dossier"
                        >
                            ${statistique.nom}
                        </span>


                        <span
                            class="note-dossier ${classeNote}"
                        >
                            ${note}
                        </span>

                    </div>
                `;

            }
        )
        .join("");


    dossier.innerHTML = `

        <div class="dossier-genetique">

            <div class="entete-dossier-genetique">

                <span>
                    Sujet étudié
                </span>

                <h3>
                    ${dragon.nom}
                </h3>

                <p>
                    ${dragon.espece}
                    ·
                    ${dragon.sexe === "Mâle" ? "♂" : "♀"}
                    ·
                    G${dragon.generation}
                </p>

            </div>


            <div class="liste-evaluations">

                ${lignesDossier}

            </div>

        </div>
    `;
}

function afficherDragonsEvaluables() {

    const selection =
        document.getElementById(
            "selection-dragon-evaluation"
        );


    selection.innerHTML = `
        <option value="">
            Choisir un dragon
        </option>
    `;


    collectionDragons.forEach(function (dragon) {

        selection.innerHTML += `
            <option value="${dragon.id}">
                ${dragon.nom} — ${dragon.espece}
            </option>
        `;

    });
}

function choisirDragonAEvaluer() {

    const idDragon =
        document.getElementById(
            "selection-dragon-evaluation"
        ).value;


    const dragon =
        collectionDragons.find(
            dragon =>
                dragon.id === idDragon
        );


    afficherDossierGenetique(dragon);


    document.getElementById(
        "resultat-evaluation"
    ).innerHTML = "";

}

function evaluerDragon() {

    const idDragon =
        document.getElementById(
            "selection-dragon-evaluation"
        ).value;


    if (idDragon === "") {

        alert(
            "Tu dois choisir un dragon."
        );

        return;
    }


    const dragon =
        collectionDragons.find(
            dragon =>
                dragon.id === idDragon
        );


    if (!dragon.evaluations) {

        dragon.evaluations = {};

    }


    const statistiques = [
        "attaque",
        "defense",
        "endurance",
        "taille",
        "intelligence",
        "magie",
        "vitesse"
    ];


    const evaluationComplete =
        statistiques.every(
            statistique =>
                dragon.evaluations[statistique]
                !== undefined
        );


    if (evaluationComplete) {

        alert(
            "Le profil génétique de ce dragon est déjà entièrement évalué."
        );

        return;
    }


    if (!depenserAction()) {

        alert(
            "Tu n'as plus d'action disponible aujourd'hui."
        );

        return;
    }


    statistiques.forEach(
        function (statistique) {

            dragon.evaluations[statistique] =
                obtenirNoteGenetique(
                    dragon.genes[statistique]
                );

        }
    );


    incrementerProgressionMission("faire_evaluation");

    sauvegarderPartie();


    afficherDossierGenetique(dragon);


    if (
        idDragonFicheOuverte
        === dragon.id
    ) {

        afficherFicheDetaillee(dragon);

    }

    const resultat =
        document.getElementById(
            "resultat-evaluation"
        );


    resultat.innerHTML = `
        <div class="resultat-genetique">

            <h3>
                ${dragon.nom}
            </h3>

            <p class="statistique-evaluee">
                Profil génétique complet révélé
            </p>

            <p class="interpretation-note">
                Les sept potentiels génétiques sont désormais connus.
            </p>

        </div>
    `;

}

// =========================================
// UTILISATION DES OBJETS D'ALTÉRATION
// GÉNÉTIQUE SUR UN DRAGON
// =========================================

const nomsStatistiquesObjets = {

    attaque: "Attaque",
    defense: "Défense",
    endurance: "Endurance",
    taille: "Taille",
    intelligence: "Intelligence",
    magie: "Magie",
    vitesse: "Vitesse"

};

const nomsCouleursObjets = {

    vert: "Vert",
    rouge: "Rouge",
    bleu: "Bleu",
    brun: "Brun",
    orange: "Orange",
    blanc: "Blanc",
    noir: "Noir",
    or: "Or"

};

function genererSectionObjetsUtilisables(dragon) {

    const idsPossedes =
        Object.keys(inventaireObjets).filter(
            function (id) {

                return (inventaireObjets[id] || 0) > 0;

            }
        );


    if (idsPossedes.length === 0) {

        return `
            <div class="section-objets-utilisables">
                <h3>Utiliser un objet</h3>
                <p class="aucun-objet">
                    Tu ne possèdes aucun objet d'altération génétique.
                    Rends-toi à la boutique pour en acheter.
                </p>
            </div>
        `;

    }


    const lignes =
        idsPossedes.map(
            function (idObjet) {

                const objet =
                    catalogueBoutique[idObjet];


                if (!objet) {

                    return "";

                }


                const quantite =
                    inventaireObjets[idObjet];

                const idSelect =
                    `select-usage-${idObjet}-${dragon.id}`;


                let controle = "";


                if (objet.type === "serum") {

                    controle = `
                        <select id="${idSelect}">
                            ${
                                Object.keys(nomsStatistiquesObjets)
                                    .map(
                                        stat =>
                                            `<option value="${stat}">${
                                                nomsStatistiquesObjets[stat]
                                            }</option>`
                                    )
                                    .join("")
                            }
                        </select>
                    `;

                }

                else if (objet.type === "teinture_choisie") {

                    controle = `
                        <select id="${idSelect}">
                            ${
                                Object.keys(nomsCouleursObjets)
                                    .map(
                                        couleur =>
                                            `<option value="${couleur}">${
                                                nomsCouleursObjets[couleur]
                                            }</option>`
                                    )
                                    .join("")
                            }
                        </select>
                    `;

                }


                const parametreAppel =
                    controle
                        ? `document.getElementById('${idSelect}').value`
                        : "null";


                return `
                    <div class="ligne-objet-utilisable">

                        <span class="nom-objet-inventaire">
                            ${objet.nom} (x${quantite})
                        </span>

                        ${controle}

                        <button
                            type="button"
                            onclick="utiliserObjet('${idObjet}', '${dragon.id}', ${parametreAppel})"
                        >
                            Utiliser
                        </button>

                    </div>
                `;

            }
        ).join("");


    return `
        <div class="section-objets-utilisables">
            <h3>Utiliser un objet</h3>
            ${lignes}
        </div>
    `;

}

function utiliserObjet(
    idObjet,
    idDragon,
    parametre
) {

    const objet =
        catalogueBoutique[idObjet];


    if (!objet) {

        return;

    }


    if (
        !inventaireObjets[idObjet]
        || inventaireObjets[idObjet] <= 0
    ) {

        alert(
            "Tu ne possèdes pas cet objet."
        );

        return;

    }


    const dragon =
        collectionDragons.find(
            function (d) {

                return d.id === idDragon;

            }
        );


    if (!dragon) {

        return;

    }


    if (objet.type === "serum") {

        const statistique = parametre;


        if (
            !dragon.genes
            || !dragon.genes[statistique]
        ) {

            return;

        }


        dragon.genes[statistique][0] =
            Math.min(
                20,
                dragon.genes[statistique][0]
                    + objet.valeur * 2
            );


        dragon.statistiques[statistique] =
            calculerStatistique(
                dragon.genes[statistique]
            );

    }

    else if (objet.type === "mutagene_aleatoire") {

        const famillesAutorisees =
            Object.keys(palettesCouleurs).filter(
                function (famille) {

                    return ![
                        "blanc",
                        "noir",
                        "or"
                    ].includes(famille);

                }
            );


        const nouvelleFamille =
            choisirAuHasard(
                famillesAutorisees
            );

        const nouvelleNuance =
            nombreAleatoire(1, 100);

        const nouvelleCouleur =
            convertirCouleurEnRgb(
                nouvelleFamille,
                nouvelleNuance
            );


        if (objet.cible === "yeux") {

            dragon.apparence.familleYeux =
                nouvelleFamille;

            dragon.apparence.nuanceYeux =
                nouvelleNuance;

            dragon.apparence.yeux =
                nouvelleCouleur;

        }

        else {

            dragon.apparence.familleEcailles =
                nouvelleFamille;

            dragon.apparence.nuanceEcailles =
                nouvelleNuance;

            dragon.apparence.ecailles =
                nouvelleCouleur;

        }


        dragon.rareteEsthetique =
            calculerRareteEsthetique(
                dragon.espece,
                dragon.apparence.familleEcailles,
                dragon.apparence.familleYeux,
                dragon.apparence.mutationEsthetique
            );

    }

    else if (objet.type === "teinture_choisie") {

        const familleChoisie = parametre;


        if (!palettesCouleurs[familleChoisie]) {

            return;

        }


        const nuance =
            nombreAleatoire(1, 100);

        const couleur =
            convertirCouleurEnRgb(
                familleChoisie,
                nuance
            );


        if (objet.cible === "yeux") {

            dragon.apparence.familleYeux =
                familleChoisie;

            dragon.apparence.nuanceYeux =
                nuance;

            dragon.apparence.yeux =
                couleur;

        }

        else {

            dragon.apparence.familleEcailles =
                familleChoisie;

            dragon.apparence.nuanceEcailles =
                nuance;

            dragon.apparence.ecailles =
                couleur;

        }


        dragon.rareteEsthetique =
            calculerRareteEsthetique(
                dragon.espece,
                dragon.apparence.familleEcailles,
                dragon.apparence.familleYeux,
                dragon.apparence.mutationEsthetique
            );

    }


    inventaireObjets[idObjet] -= 1;


    sauvegarderPartie();

    afficherFicheDetaillee(dragon);

    afficherCollection();

}

function afficherFicheDetaillee(dragon) {

    const fiche =
        document.getElementById(
            "fiche-detaillee-dragon"
        );

    const panneau =
        document.getElementById(
            "panneau-fiche-dragon"
        );

    const fond =
        document.getElementById(
            "fond-panneau-dragon"
        );


    // Si aucun dragon n'est fourni,
    // on ferme simplement la fiche.

    if (!dragon) {

        fiche.innerHTML = "";

        panneau.classList.remove(
            "ouvert"
        );

        fond.classList.remove(
            "ouvert"
        );

        idDragonFicheOuverte = null;

        return;
    }


    // Mémorise le dragon actuellement affiché.

    idDragonFicheOuverte =
        dragon.id;


    // Ouvre le panneau et son fond sombre.

    panneau.classList.add(
        "ouvert"
    );

    fond.classList.add(
        "ouvert"
    );


    // Évaluations génétiques déjà connues.

    const evaluations =
        dragon.evaluations || {};

	const scorePerfection =
    calculerScorePerfection(dragon);

	const pourcentagePerfection =
    calculerPourcentagePerfection(dragon);

    const affichageRareteDragon =
    estDragonUnique(dragon)

        ? `
            <span class="rarete-dragon-unique">
                ◆ UNIQUE
            </span>

            <strong>
                ${obtenirTitreDragonUnique(dragon)}
            </strong>
        `

        : `
            <span class="etoiles-rarete">
                ${genererEtoiles(
                    dragon.rareteEsthetique.etoiles
                )}
            </span>

            <strong>
                ${obtenirLibelleRarete(
                    dragon.rareteEsthetique.etoiles
                )}
            </strong>
        `;

    // Noms des parents.

    const nomPere =
        dragon.parents &&
        dragon.parents.pere
            ? dragon.parents.pere.nom
            : "Inconnu";


    const nomMere =
        dragon.parents &&
        dragon.parents.mere
            ? dragon.parents.mere.nom
            : "Inconnue";


    // =================================
    // CRÉATION DU CONTENU DE LA FICHE
    // =================================

                let badgeMutation = "";

if (dragon.mutation) {

    badgeMutation = `

    <div class="badge-mutation">

        🧬 Mutation

    </div>

    `;

}

    fiche.innerHTML = `

        <div class="fiche-detaillee">

            <div class="entete-fiche">

                <div class="identite-fiche">

                    <div class="nom-dragon-fiche">

                <h2>
                    ${dragon.nom}
                </h2>

                ${badgeMutation}

                <button
                    id="bouton-renommer-dragon"
                    class="bouton-renommer-dragon"
                    type="button"
                    title="Renommer ce dragon"
                >
                    ✎
                </button>

                </div>  

                    <p>
                        ${dragon.espece}
                        ·
                        ${dragon.sexe === "Mâle" ? "♂" : "♀"}
                        ·
                        G${dragon.generation}
                    </p>

                </div>


                <button
                    id="bouton-fermer-fiche"
                    class="bouton-fermer-fiche"
                    type="button"
                >
                    Fermer
                </button>

            </div>

			<div class="perfection-dragon">

    <div class="entete-perfection">

        <span>
            Perfection statistique
        </span>

        <strong>
            ${scorePerfection} / 140
        </strong>

    </div>


    <div class="barre-perfection">

        <div
            class="progression-perfection"
            style="width: ${pourcentagePerfection}%"
        >
        </div>

    </div>


    <p>
        ${pourcentagePerfection} %
    </p>

</div>

            <div class="colonnes-fiche">


                <!-- ========================= -->
                <!-- STATISTIQUES              -->
                <!-- ========================= -->

                <div class="bloc-fiche">

                    <h3>
                        Statistiques
                    </h3>

                    <p>
                        <span>Attaque</span>
                        <strong>
                            ${dragon.statistiques.attaque}
                        </strong>
                    </p>

                    <p>
                        <span>Défense</span>
                        <strong>
                            ${dragon.statistiques.defense}
                        </strong>
                    </p>

                    <p>
                        <span>Endurance</span>
                        <strong>
                            ${dragon.statistiques.endurance}
                        </strong>
                    </p>

                    <p>
                        <span>Taille</span>
                        <strong>
                            ${dragon.statistiques.taille}
                        </strong>
                    </p>

                    <p>
                        <span>Intelligence</span>
                        <strong>
                            ${dragon.statistiques.intelligence}
                        </strong>
                    </p>

                    <p>
                        <span>Magie</span>
                        <strong>
                            ${dragon.statistiques.magie}
                        </strong>
                    </p>

                    <p>
                        <span>Vitesse</span>
                        <strong>
                            ${dragon.statistiques.vitesse}
                        </strong>
                    </p>

        ${dragon.mutation ?

`

<div class="details-mutation">

<b>Mutation :</b><br>

${dragon.mutation.texte}

</div>

`

:

""

}

                </div>
				
				                <!-- ========================= -->
                <!-- RARETÉ ESTHÉTIQUE         -->
                <!-- ========================= -->

                <div class="bloc-fiche rarete-esthetique-fiche">

                    <h3>
                        Rareté esthétique
                    </h3>

                    ${
    dragon.rareteEsthetique

        ? dragon.apparence.mutationEsthetique
            === "albinisme"

            ? `

                <div class="detail-rarete mutation-albinisme">

                    <div class="detail-rarete-entete">
                        <span>Écailles</span>
                        <em>Albinos</em>
                    </div>

                    <strong>
                        Blanc ivoire
                    </strong>

                    <p class="explication-rarete">
                        La pigmentation naturelle des écailles est masquée
                        par l'albinisme.
                    </p>

                </div>


                <div class="detail-rarete mutation-albinisme">

                    <div class="detail-rarete-entete">
                        <span>Yeux</span>
                        <em>Albinos</em>
                    </div>

                    <strong>
                        Rouge
                    </strong>

                </div>


                <div class="detail-rarete mutation-detectee">

                    <div class="detail-rarete-entete">
                        <span>Mutation</span>
                        <em>Exceptionnelle</em>
                    </div>

                    <strong>
                        Albinisme
                    </strong>

                    <p class="explication-rarete">
                        Mutation chromatique rarissime affectant
                        la pigmentation visible.
                    </p>

                </div>


                <div class="couleurs-hereditaires">

                    <span class="titre-couleurs-hereditaires">
                        Couleurs héréditaires
                    </span>

                    <p>
    <span>Écailles</span>

    <strong>
        ${obtenirNomEcaillesAffiche(dragon)}
    </strong>
</p>

<p>
    <span>Yeux</span>

    <strong>
        ${obtenirNomYeuxAffiche(dragon)}
    </strong>
</p>

                    <small>
                        Ces couleurs restent transmissibles
                        à la descendance.
                    </small>

                </div>


                <div class="score-rarete-fiche">

    ${affichageRareteDragon}

</div>

            `

            : dragon.apparence.mutationEsthetique
    === "opalescence"

    ? `

        <div class="detail-rarete mutation-opalescence">

            <div class="detail-rarete-entete">
                <span>Écailles</span>
                <em>Opalescentes</em>
            </div>

            <strong>
                Reflets nacrés
            </strong>

            <p class="explication-rarete">
                Les écailles présentent des reflets laiteux
                et pastel qui masquent leur couleur naturelle.
            </p>

        </div>


        <div class="detail-rarete">

            <div class="detail-rarete-entete">

                <span>
                    Yeux
                </span>

                <em>
                    ${formaterNomCouleur(
                        dragon.rareteEsthetique
                            .yeux.niveau
                    )}
                </em>

            </div>

            <strong>
                ${obtenirNomYeuxAffiche(dragon)}
            </strong>

        </div>


        <div class="detail-rarete mutation-detectee">

            <div class="detail-rarete-entete">
                <span>Mutation</span>
                <em>Exceptionnelle</em>
            </div>

            <strong>
                Opalescence
            </strong>

            <p class="explication-rarete">
                Mutation chromatique rarissime donnant
                aux écailles des reflets nacrés.
            </p>

        </div>


        <div class="couleurs-hereditaires">

            <span class="titre-couleurs-hereditaires">
                Couleur héréditaire
            </span>

            <p>
                <span>Écailles</span>

                <strong>
                    ${formaterNomCouleur(
                        dragon.apparence.familleEcailles
                    )}
                </strong>
            </p>

            <small>
                Cette couleur reste transmissible
                à la descendance.
            </small>

        </div>


        <div class="score-rarete-fiche">

    ${affichageRareteDragon}

</div>

    `

    : dragon.apparence.mutationEsthetique
        === "iridescence"

                ? `

                    <div class="detail-rarete mutation-iridescence">

                        <div class="detail-rarete-entete">
                            <span>Écailles</span>
                            <em>Iridescentes</em>
                        </div>

                        <strong>
                            Reflets irisés
                        </strong>

                        <p class="explication-rarete">
                            Les écailles présentent des reflets changeants
                            qui masquent leur couleur naturelle.
                        </p>

                    </div>


                    <div class="detail-rarete">

                        <div class="detail-rarete-entete">

                            <span>
                                Yeux
                            </span>

                            <em>
                                ${formaterNomCouleur(
                                    dragon.rareteEsthetique
                                        .yeux.niveau
                                )}
                            </em>

                        </div>

                        <strong>
                            ${obtenirNomYeuxAffiche(dragon)}
                        </strong>

                    </div>


                    <div class="detail-rarete mutation-detectee">

                        <div class="detail-rarete-entete">
                            <span>Mutation</span>
                            <em>Exceptionnelle</em>
                        </div>

                        <strong>
                            Iridescence
                        </strong>

                        <p class="explication-rarete">
                            Mutation chromatique rarissime affectant
                            les reflets des écailles.
                        </p>

                    </div>


                    <div class="couleurs-hereditaires">

                        <span class="titre-couleurs-hereditaires">
                            Couleur héréditaire
                        </span>

                        <p>
                            <span>Écailles</span>

                            <strong>
                                ${formaterNomCouleur(
                                    dragon.apparence.familleEcailles
                                )}
                            </strong>
                        </p>

                        <small>
                            Cette couleur reste transmissible
                            à la descendance.
                        </small>

                    </div>


                    <div class="score-rarete-fiche">

    ${affichageRareteDragon}

</div>

                `

: dragon.apparence.mutationEsthetique
    === "heterochromie"

? `
<div class="detail-rarete">

    <div class="detail-rarete-entete">
        <span>Écailles</span>

        <em>
            ${formaterNomCouleur(
                dragon.rareteEsthetique
                    .ecailles.niveau
            )}
        </em>
    </div>

    <strong>
        ${formaterNomCouleur(
            dragon.apparence
                .familleEcailles
        )}
    </strong>

</div>


<div class="detail-rarete mutation-heterochromie">

    <div class="detail-rarete-entete">
        <span>Yeux</span>
        <em>Hétérochromes</em>
    </div>

    <div class="yeux-heterochromes-fiche">

        <span>
            ${obtenirNomYeuxAffiche(dragon)}
        </span>

        <span class="separateur-yeux">
            ·
        </span>

        <span>
            ${formaterNomCouleur(
                dragon.apparence.familleSecondOeil
            )}
        </span>

    </div>

    <p class="explication-rarete">
        Les deux yeux présentent des couleurs distinctes.
    </p>

</div>


<div class="detail-rarete mutation-detectee">

    <div class="detail-rarete-entete">
        <span>Mutation</span>
        <em>Exceptionnelle</em>
    </div>

    <strong>
        Hétérochromie
    </strong>

    <p class="explication-rarete">
        Mutation chromatique rarissime affectant la couleur visible des yeux.
    </p>

</div>


<div class="couleurs-hereditaires">

    <span class="titre-couleurs-hereditaires">
        Couleur héréditaire
    </span>

    <p>
        <span>Yeux</span>

        <strong>
            ${obtenirNomYeuxAffiche(dragon)}
        </strong>
    </p>

    <small>
        Cette couleur reste transmissible à la descendance.
    </small>

</div>


<div class="score-rarete-fiche">

    ${affichageRareteDragon}

</div>

`
				

                : `

                    <div class="detail-rarete">

                        <div class="detail-rarete-entete">

                            <span>
                                Écailles
                            </span>

                            <em>
                                ${formaterNomCouleur(
                                    dragon.rareteEsthetique
                                        .ecailles.niveau
                                )}
                            </em>

                        </div>

                        <strong>
                            ${formaterNomCouleur(
                                dragon.apparence
                                    .familleEcailles
                            )}
                        </strong>

                        <p class="explication-rarete">

                            ${
                                dragon.rareteEsthetique
                                    .ecailles.niveau
                                    === "commun"

                                    ? "Couleur répandue pour cette espèce."

                                    : dragon.rareteEsthetique
                                        .ecailles.niveau
                                        === "rare"

                                    ? "Couleur rare pour cette espèce."

                                    : dragon.rareteEsthetique
                                        .ecailles.niveau
                                        === "exceptionnel"

                                    ? "Couleur exceptionnelle, commune à toutes les espèces."

                                    : "Couleur inhabituelle pour cette espèce."
                            }

                        </p>

                    </div>


                    <div class="detail-rarete">

                        <div class="detail-rarete-entete">

                            <span>
                                Yeux
                            </span>

                            <em>
                                ${formaterNomCouleur(
                                    dragon.rareteEsthetique
                                        .yeux.niveau
                                )}
                            </em>

                        </div>

                        <strong>
                            ${formaterNomCouleur(
                                dragon.apparence
                                    .familleYeux
                            )}
                        </strong>

                    </div>


                    <div class="detail-rarete">

                        <div class="detail-rarete-entete">
                            <span>
                                Mutation
                            </span>
                        </div>

                        <strong>

                            ${
                                dragon.rareteEsthetique
                                    .mutation

                                    ? dragon.rareteEsthetique
                                        .mutation.nom

                                    : "Aucune"
                            }

                        </strong>

                    </div>


                    <div class="score-rarete-fiche">

    ${affichageRareteDragon}

</div>

                `

        : `

            <p class="rarete-indisponible">
                Données esthétiques non répertoriées.
            </p>

        `
}
                </div>


                <!-- ========================= -->
                <!-- POTENTIEL REPRODUCTEUR    -->
                <!-- ========================= -->

                <div class="bloc-fiche">

                    <h3>
                        Potentiel reproducteur
                    </h3>

                    <p>
                        <span>Attaque</span>
                        <strong>
                            ${evaluations.attaque || "?"}
                        </strong>
                    </p>

                    <p>
                        <span>Défense</span>
                        <strong>
                            ${evaluations.defense || "?"}
                        </strong>
                    </p>

                    <p>
                        <span>Endurance</span>
                        <strong>
                            ${evaluations.endurance || "?"}
                        </strong>
                    </p>

                    <p>
                        <span>Taille</span>
                        <strong>
                            ${evaluations.taille || "?"}
                        </strong>
                    </p>

                    <p>
                        <span>Intelligence</span>
                        <strong>
                            ${evaluations.intelligence || "?"}
                        </strong>
                    </p>

                    <p>
                        <span>Magie</span>
                        <strong>
                            ${evaluations.magie || "?"}
                        </strong>
                    </p>

                    <p>
                        <span>Vitesse</span>
                        <strong>
                            ${evaluations.vitesse || "?"}
                        </strong>
                    </p>

                </div>


                <!-- ========================= -->
                <!-- ORIGINE                   -->
                <!-- ========================= -->

                <div class="bloc-fiche">

                    <h3>
                        Origine
                    </h3>

                    <p>
                        <span>Origine</span>

                        <strong>
                            ${dragon.origine}
                        </strong>
                    </p>


                    <p>
                        <span>Père</span>

                        ${
                            dragon.parents &&
                            dragon.parents.pere

                                ? `
                                    <button
                                        class="lien-parent"
                                        data-parent-id="${dragon.parents.pere.id}"
                                        type="button"
                                    >
                                        ${nomPere}

                                        <span aria-hidden="true">
                                            →
                                        </span>
                                    </button>
                                `

                                : `
                                    <strong>
                                        Inconnu
                                    </strong>
                                `
                        }
                    </p>


                    <p>
                        <span>Mère</span>

                        ${
                            dragon.parents &&
                            dragon.parents.mere

                                ? `
                                    <button
                                        class="lien-parent"
                                        data-parent-id="${dragon.parents.mere.id}"
                                        type="button"
                                    >
                                        ${nomMere}

                                        <span aria-hidden="true">
                                            →
                                        </span>
                                    </button>
                                `

                                : `
                                    <strong>
                                        Inconnue
                                    </strong>
                                `
                        }
                    </p>

                </div>
				

                        </div>


            <button
                id="bouton-voir-genealogie"
                type="button"
            >
                Voir la généalogie
            </button>


            <button
                class="bouton-don"
                type="button"
                onclick="donnerDragon('${dragon.id}')"
            >
                Faire don de ce dragon
            </button>


            <button
                class="bouton-danger"
                type="button"
                onclick="relacherDragon('${dragon.id}')"
            >
                Relâcher ce dragon
            </button>

            ${genererSectionObjetsUtilisables(dragon)}

        </div>
    `;


    // =================================
    // NAVIGATION VERS LES PARENTS
    // =================================

    const liensParents =
        fiche.querySelectorAll(
            ".lien-parent"
        );


    liensParents.forEach(
        function (lienParent) {

            lienParent.addEventListener(
                "click",
                function () {

                    // Les IDs sont des UUID :
                    // on ne doit surtout pas utiliser Number().

                    const idParent =
                        lienParent.dataset.parentId;


                    const parent =
                        collectionDragons.find(
                            function (dragonCollection) {

                                return (
                                    dragonCollection.id
                                    === idParent
                                );

                            }
                        );


                    if (!parent) {

                        return;

                    }


                    afficherFicheDetaillee(
                        parent
                    );

                }
            );

        }
    );

        // =================================
    // BOUTON GÉNÉALOGIE
    // =================================

    const boutonGenealogie =
        document.getElementById(
            "bouton-voir-genealogie"
        );


    boutonGenealogie.addEventListener(
        "click",
        function () {

         afficherGenealogie(
    dragon
);   

        }
    );

    // =================================
// BOUTON RENOMMER LE DRAGON
// =================================

const boutonRenommer =
    document.getElementById(
        "bouton-renommer-dragon"
    );


boutonRenommer.addEventListener(
    "click",
    function () {

        const zoneNom =
    document.querySelector(
        ".nom-dragon-fiche"
    );


zoneNom.innerHTML = `

    <input
        id="champ-nouveau-nom"
        class="champ-nouveau-nom"
        type="text"
        maxlength="20"
    >

    <button
        id="bouton-valider-nom"
        class="bouton-valider-nom"
        type="button"
    >
        ✓
    </button>

`;
    const champNouveauNom =
    document.getElementById(
        "champ-nouveau-nom"
    );


champNouveauNom.value =
    dragon.nom;


champNouveauNom.focus();


champNouveauNom.select();

    const boutonValiderNom =
    document.getElementById(
        "bouton-valider-nom"
    );


boutonValiderNom.addEventListener(
    "click",
    function () {

        const nouveauNom =
            champNouveauNom.value.trim();


        if (nouveauNom === "") {

            return;

        }


        dragon.nom =
    nouveauNom;


// Met à jour toutes les zones qui affichent les dragons

afficherCollection();

afficherParentsDisponibles();

afficherDragonsEvaluables();


// Sauvegarde le nouveau nom

sauvegarderPartie();


// Réaffiche la grande fiche avec le nouveau nom

afficherFicheDetaillee(
    dragon
);

    }
);
champNouveauNom.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            boutonValiderNom.click();

        }

    }
);
    }
    
);

    // =================================
    // BOUTON FERMER
    // =================================

    const boutonFermer =
        document.getElementById(
            "bouton-fermer-fiche"
        );


    boutonFermer.addEventListener(
        "click",
        function () {

            panneau.classList.remove(
                "ouvert"
            );

            fond.classList.remove(
                "ouvert"
            );

            fiche.innerHTML = "";

            idDragonFicheOuverte = null;

        }
    );


    // =================================
    // CLIC SUR LE FOND SOMBRE
    // =================================

    fond.onclick =
        function () {

            panneau.classList.remove(
                "ouvert"
            );

            fond.classList.remove(
                "ouvert"
            );

            fiche.innerHTML = "";

            idDragonFicheOuverte = null;

        };

}

function dragonADesDescendants(idDragon) {
    return collectionDragons.some(
        function (dragon) {
            if (!dragon.parents) {
                return false;
            }

            return (
                dragon.parents.pere === idDragon
                || dragon.parents.mere === idDragon
            );
        }
    );
}


function relacherDragon(idDragon) {
    const dragon =
        collectionDragons.find(
            function (dragon) {
                return dragon.id === idDragon;
            }
        );

    if (!dragon) {
        return;
    }

    const nomDragon =
        dragon.nom && dragon.nom.trim() !== ""
            ? dragon.nom
            : "ce dragon";

    const aDesDescendants =
        dragonADesDescendants(idDragon);

    let message =
        "Relâcher "
        + nomDragon
        + " ?\n\n"
        + "Cette action retirera le dragon de ton élevage.";

    if (aDesDescendants) {
        message +=
            "\n\nCe dragon apparaît dans la lignée d'autres dragons. "
            + "Ses descendants resteront dans ton élevage, mais sa fiche ne sera plus disponible.";
    }

    message +=
        "\n\nCette action est définitive.";

    const confirmation =
        confirm(message);

    if (!confirmation) {
        return;
    }

    collectionDragons =
        collectionDragons.filter(
            function (dragon) {
                return dragon.id !== idDragon;
            }
        );

    idDragonFicheOuverte = null;

    afficherCollection();
    afficherParentsDisponibles();
    afficherDragonsEvaluables();
    verifierSucces();
    sauvegarderPartie();

}

// =========================================
// BOURSE DE DONS ENTRE JOUEURS
// =========================================
//
// Principe important : le serveur ne modifie JAMAIS
// directement la sauvegarde d'un joueur pour déposer ou
// livrer un dragon. Les dons vivent dans leur propre
// table (dons_dragons), complètement séparée de la table
// "sauvegardes". C'est toujours le client (donneur ou
// receveur) qui ajoute/retire le dragon de SA PROPRE
// collection en mémoire, puis appelle sauvegarderPartie()
// normalement — exactement le même chemin que n'importe
// quelle autre action du joueur. Ça évite qu'un dépôt ou
// une réclamation ne se fasse écraser par la prochaine
// sauvegarde automatique du client concerné, le genre de
// course qu'on a identifié en travaillant sur les missions.

async function donnerDragon(idDragon) {

    const dragon =
        collectionDragons.find(
            function (d) {
                return d.id === idDragon;
            }
        );

    if (!dragon) {
        return;
    }


    const nomDragon =
        dragon.nom && dragon.nom.trim() !== ""
            ? dragon.nom
            : "ce dragon";

    const aDesDescendants =
        dragonADesDescendants(idDragon);

    let message =
        "Faire don de "
        + nomDragon
        + " ?\n\nIl quittera immédiatement ton élevage "
        + "et rejoindra la bourse des dons.";

    if (aDesDescendants) {

        message +=
            "\n\nCe dragon apparaît dans la lignée "
            + "d'autres dragons. Ses descendants "
            + "resteront dans ton élevage, mais sa "
            + "fiche ne sera plus disponible.";

    }

    message +=
        "\n\nTu pourras annuler le don tant que "
        + "personne ne l'a réclamé, depuis l'écran "
        + "\"Dons\".";


    if (!confirm(message)) {
        return;
    }


    const destinataireSaisi =
        prompt(
            "Code du destinataire (optionnel) : "
            + "laisse vide pour la bourse publique, "
            + "que n'importe quel joueur peut "
            + "consulter et réclamer."
        );

    // prompt() renvoie null si le joueur annule la
    // boîte de dialogue : dans ce cas, on annule tout
    // le don, rien n'a encore bougé.

    if (destinataireSaisi === null) {
        return;
    }

    const destinataireId =
        destinataireSaisi.trim() !== ""
            ? destinataireSaisi.trim()
            : null;


    // On retire tout de suite le dragon de la
    // collection locale : du point de vue du joueur,
    // le don est déjà parti.

    collectionDragons =
        collectionDragons.filter(
            function (d) {
                return d.id !== idDragon;
            }
        );

    idDragonFicheOuverte = null;

    afficherFicheDetaillee(null);
    afficherCollection();
    afficherParentsDisponibles();
    afficherDragonsEvaluables();
    verifierSucces();


    try {

        const reponse =
            await fetch(
                "/api/deposer-don",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            donneurId:
                                obtenirIdentifiantJoueur(),
                            dragon: dragon,
                            destinataireId:
                                destinataireId
                        })
                }
            );

        const resultat =
            await reponse.json();

        if (
            !reponse.ok
            || !resultat.succes
        ) {

            throw new Error(
                resultat.erreur
                || "Erreur inconnue."
            );

        }


        afficherEtatSynchronisation(
            "Don déposé avec succès.",
            "succes"
        );


        chargerEtAfficherDons();

    }

    catch (erreur) {

        console.error(
            "Erreur dépôt du don :",
            erreur
        );


        // Le dépôt a échoué côté serveur : on rend le
        // dragon au joueur immédiatement pour ne rien
        // perdre.

        collectionDragons.push(dragon);

        afficherCollection();
        afficherParentsDisponibles();
        afficherDragonsEvaluables();


        afficherEtatSynchronisation(
            "Le don n'a pas pu être déposé : "
            + "le dragon t'a été rendu.",
            "erreur"
        );

    }


    sauvegarderPartie();

}

async function reclamerDonDragon(idDon) {

    if (
        !confirm(
            "Réclamer ce dragon ? Il rejoindra "
            + "ton élevage."
        )
    ) {
        return;
    }


    try {

        const reponse =
            await fetch(
                "/api/reclamer-don",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            idDon: idDon,
                            joueurId:
                                obtenirIdentifiantJoueur()
                        })
                }
            );

        const resultat =
            await reponse.json();

        if (
            !reponse.ok
            || !resultat.succes
        ) {

            throw new Error(
                resultat.erreur
                || "Erreur inconnue."
            );

        }


        collectionDragons.push(
            resultat.dragon
        );

        incrementerProgressionMission(
            "recueillir_don"
        );

        afficherCollection();
        afficherParentsDisponibles();
        afficherDragonsEvaluables();
        verifierSucces();
        sauvegarderPartie();


        afficherEtatSynchronisation(
            (
                resultat.dragon.nom
                || "Un dragon"
            )
            + " a rejoint ton élevage !",
            "succes"
        );


        chargerEtAfficherDons();

    }

    catch (erreur) {

        console.error(
            "Erreur réclamation du don :",
            erreur
        );


        afficherEtatSynchronisation(
            erreur.message
            || "Impossible de réclamer ce don.",
            "erreur"
        );


        // La liste a peut-être changé entre-temps
        // (don déjà pris par quelqu'un d'autre) :
        // on la rafraîchit.

        chargerEtAfficherDons();

    }

}

async function annulerDonDragon(idDon) {

    if (
        !confirm(
            "Annuler ce don et récupérer le dragon "
            + "dans ton élevage ?"
        )
    ) {
        return;
    }


    try {

        const reponse =
            await fetch(
                "/api/annuler-don",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            idDon: idDon,
                            donneurId:
                                obtenirIdentifiantJoueur()
                        })
                }
            );

        const resultat =
            await reponse.json();

        if (
            !reponse.ok
            || !resultat.succes
        ) {

            throw new Error(
                resultat.erreur
                || "Erreur inconnue."
            );

        }


        collectionDragons.push(
            resultat.dragon
        );

        afficherCollection();
        afficherParentsDisponibles();
        afficherDragonsEvaluables();
        verifierSucces();
        sauvegarderPartie();


        afficherEtatSynchronisation(
            "Don annulé : le dragon est de "
            + "retour dans ton élevage.",
            "succes"
        );


        chargerEtAfficherDons();

    }

    catch (erreur) {

        console.error(
            "Erreur annulation du don :",
            erreur
        );


        afficherEtatSynchronisation(
            erreur.message
            || "Impossible d'annuler ce don.",
            "erreur"
        );


        chargerEtAfficherDons();

    }

}

// Reprend exactement le gabarit visuel de .carte-dragon
// (l'écran Élevage) pour que les dragons de la bourse
// aient la même richesse d'affichage — stats, couleurs
// d'écailles/yeux, etc. — plutôt qu'un simple résumé
// textuel. "piedDeCarte" est le seul bloc qui change
// entre "Dragons disponibles" et "Mes dons en cours".

function genererCarteDragonDon(dragon, piedDeCarte) {

    const statistiques =
        dragon.statistiques
            || {
                attaque: "?",
                defense: "?",
                endurance: "?",
                taille: "?",
                intelligence: "?",
                magie: "?",
                vitesse: "?"
            };

    return `
        <div class="carte-dragon carte-don">

            <div class="entete-carte-dragon">

                <h3>
                    ${dragon.nom || "Dragon sans nom"}
                </h3>

                <span class="identite-carte-dragon">
                    ${dragon.sexe === "Mâle" ? "♂" : "♀"}
                    ${
                        dragon.generation !== undefined
                            ? dragon.generation
                            : ""
                    }
                </span>

            </div>

            <p class="espece-carte-dragon">
                ${dragon.espece || "Espèce inconnue"}
            </p>

            <p class="origine-carte-dragon">
                Perfection :
                ${
                    dragon.statistiques
                        ? calculerPourcentagePerfection(dragon)
                        : "?"
                }%
            </p>

            <div class="mini-grille-stats">

                <div class="mini-stat">
                    <span class="mini-stat-nom">ATQ</span>
                    <strong>${statistiques.attaque}</strong>
                </div>

                <div class="mini-stat">
                    <span class="mini-stat-nom">DEF</span>
                    <strong>${statistiques.defense}</strong>
                </div>

                <div class="mini-stat">
                    <span class="mini-stat-nom">END</span>
                    <strong>${statistiques.endurance}</strong>
                </div>

                <div class="mini-stat">
                    <span class="mini-stat-nom">TAI</span>
                    <strong>${statistiques.taille}</strong>
                </div>

                <div class="mini-stat">
                    <span class="mini-stat-nom">INT</span>
                    <strong>${statistiques.intelligence}</strong>
                </div>

                <div class="mini-stat">
                    <span class="mini-stat-nom">MAG</span>
                    <strong>${statistiques.magie}</strong>
                </div>

                <div class="mini-stat">
                    <span class="mini-stat-nom">VIT</span>
                    <strong>${statistiques.vitesse}</strong>
                </div>

            </div>

            ${
                dragon.apparence
                    ? `
                        <div class="apparence-carte">

                            <div class="ligne-apparence">

                                <span>
                                    Écailles :
                                </span>

                                <span
                                    class="pastille-couleur ${obtenirClassePastilleEcailles(dragon)}"
                                    style="background-color: ${dragon.apparence.ecailles};"
                                ></span>

                            </div>

                            <div class="ligne-apparence">

                                <span>
                                    Yeux :
                                </span>

                                ${genererAffichageYeux(dragon)}

                            </div>

                        </div>
                    `
                    : ""
            }

            ${piedDeCarte}

        </div>
    `;

}

function afficherListeDonsDisponibles(dons) {

    const conteneur =
        document.getElementById(
            "liste-dons-disponibles"
        );

    if (!conteneur) {
        return;
    }


    if (dons.length === 0) {

        conteneur.innerHTML = `
            <p>Aucun don disponible pour le moment.</p>
        `;

        return;

    }


    conteneur.innerHTML =
        dons.map(
            function (don) {

                const piedDeCarte = `
                    <p class="origine-don">
                        Donné par
                        ${don.donneurId.slice(0, 8)}…
                    </p>

                    <button
                        type="button"
                        onclick="reclamerDonDragon('${don.id}')"
                    >
                        Réclamer
                    </button>
                `;

                return genererCarteDragonDon(
                    don.dragon,
                    piedDeCarte
                );

            }
        ).join("");

}

function afficherListeMesDons(dons) {

    const conteneur =
        document.getElementById(
            "liste-mes-dons"
        );

    if (!conteneur) {
        return;
    }


    if (dons.length === 0) {

        conteneur.innerHTML = `
            <p>Tu n'as aucun don en attente.</p>
        `;

        return;

    }


    conteneur.innerHTML =
        dons.map(
            function (don) {

                const piedDeCarte = `
                    <p class="origine-don">
                        ${
                            don.destinataireId
                                ? "Réservé à "
                                    + don.destinataireId.slice(0, 8)
                                    + "…"
                                : "Bourse publique"
                        }
                    </p>

                    <button
                        type="button"
                        onclick="annulerDonDragon('${don.id}')"
                    >
                        Annuler
                    </button>
                `;

                return genererCarteDragonDon(
                    don.dragon,
                    piedDeCarte
                );

            }
        ).join("");

}

async function chargerEtAfficherDons() {

    const conteneurDisponibles =
        document.getElementById(
            "liste-dons-disponibles"
        );

    const conteneurMesDons =
        document.getElementById(
            "liste-mes-dons"
        );

    if (!conteneurDisponibles && !conteneurMesDons) {
        return;
    }


    try {

        const reponse =
            await fetch(
                "/api/lister-dons",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            joueurId:
                                obtenirIdentifiantJoueur()
                        })
                }
            );

        const resultat =
            await reponse.json();

        if (
            !reponse.ok
            || !resultat.succes
        ) {

            throw new Error(
                resultat.erreur
                || "Erreur inconnue."
            );

        }


        afficherListeDonsDisponibles(
            resultat.donsDisponibles
        );

        afficherListeMesDons(
            resultat.mesDons
        );

    }

    catch (erreur) {

        console.error(
            "Erreur chargement des dons :",
            erreur
        );


        if (conteneurDisponibles) {

            conteneurDisponibles.innerHTML = `
                <p>
                    Impossible de charger la bourse
                    pour le moment.
                </p>
            `;

        }


        if (conteneurMesDons) {

            conteneurMesDons.innerHTML = "";

        }

    }

}

function afficherCollection() {

    const zoneCollection =
        document.getElementById("collection-dragons");

    const compteur =
        document.getElementById("compteur-dragons");
		
	const compteurAffiches =
        document.getElementById(
            "compteur-dragons-affiches"
        );


    const recherche =
        document.getElementById(
            "recherche-dragon"
        ).value
        .trim()
        .toLowerCase();


    const filtreEspece =
        document.getElementById(
            "filtre-espece"
        ).value;


    const filtreSexe =
        document.getElementById(
            "filtre-sexe"
        ).value;
    
    const filtreCouleur =
    document.getElementById(
        "filtre-couleur"
    ).value;


const filtreRarete =
    document.getElementById(
        "filtre-rarete"
    ).value;


    const tri =
        document.getElementById(
            "tri-dragons"
        ).value;
	
	let dragonsAffiches =
        [...collectionDragons];
		
	if (recherche !== "") {

        dragonsAffiches =
            dragonsAffiches.filter(
                function (dragon) {

                    return dragon.nom
                        .toLowerCase()
                        .includes(recherche);

                }
            );

    }
	
	    if (filtreEspece !== "toutes") {

        dragonsAffiches =
            dragonsAffiches.filter(
                function (dragon) {

                    return (
                        dragon.espece
                        === filtreEspece
                    );

                }
            );

    }
	
	    if (filtreSexe !== "tous") {

        dragonsAffiches =
            dragonsAffiches.filter(
                function (dragon) {

                    return (
                        dragon.sexe
                        === filtreSexe
                    );

                }
            );

    }

    if (filtreCouleur !== "toutes") {

    dragonsAffiches =
        dragonsAffiches.filter(
            function (dragon) {

                return (
                    dragon.apparence
                    &&
                    dragon.apparence.familleEcailles
                    === filtreCouleur
                );

            }
        );

}


if (filtreRarete !== "toutes") {

    dragonsAffiches =
        dragonsAffiches.filter(
            function (dragon) {

                return (
                    dragon.rareteEsthetique
                    &&
                    dragon.rareteEsthetique.etoiles
                    === Number(filtreRarete)
                );

            }
        );

}
	
	    if (tri === "nom-az") {

        dragonsAffiches.sort(
            function (a, b) {

                return a.nom.localeCompare(
                    b.nom,
                    "fr"
                );

            }
        );

    }


    if (tri === "nom-za") {

        dragonsAffiches.sort(
            function (a, b) {

                return b.nom.localeCompare(
                    a.nom,
                    "fr"
                );

            }
        );

    }


    if (tri === "score-desc") {

        dragonsAffiches.sort(
            function (a, b) {

                return (
                    calculerScorePerfection(b)
                    -
                    calculerScorePerfection(a)
                );

            }
        );

    }


    if (tri === "score-asc") {

        dragonsAffiches.sort(
            function (a, b) {

                return (
                    calculerScorePerfection(a)
                    -
                    calculerScorePerfection(b)
                );

            }
        );

    }


    if (tri === "generation-desc") {

        dragonsAffiches.sort(
            function (a, b) {

                return (
                    b.generation
                    -
                    a.generation
                );

            }
        );

    }


    if (tri === "generation-asc") {

        dragonsAffiches.sort(
            function (a, b) {

                return (
                    a.generation
                    -
                    b.generation
                );

            }
        );

    }


    compteur.textContent =
        collectionDragons.length + " dragon(s)";
		
	if (
        dragonsAffiches.length
        === collectionDragons.length
    ) {

        compteurAffiches.textContent = "";

    } else {

        compteurAffiches.textContent =
            dragonsAffiches.length
            + " dragon(s) affiché(s) sur "
            + collectionDragons.length;

    }


    if (collectionDragons.length === 0) {

        zoneCollection.innerHTML =
            "<p>Ton élevage est vide.</p>";

        return;
    }
	
	    if (dragonsAffiches.length === 0) {

        zoneCollection.innerHTML = `
            <p>
                Aucun dragon ne correspond
                aux critères sélectionnés.
            </p>
        `;

        return;
    }


    zoneCollection.innerHTML = "";


    dragonsAffiches.forEach(function (dragon) {

        zoneCollection.innerHTML += `
            <div class="carte-dragon">

                <div class="entete-carte-dragon">

    <h3>
        ${dragon.nom}
    </h3>

    <span class="identite-carte-dragon">
        ${dragon.sexe === "Mâle" ? "♂" : "♀"}
        ${dragon.generation}
    </span>

</div>

<p class="espece-carte-dragon">
    ${dragon.espece}
</p>

<p class="origine-carte-dragon">
    ${dragon.origine}
</p>

	<div class="mini-grille-stats">

    <div class="mini-stat">
        <span class="mini-stat-nom">ATQ</span>
        <strong>${dragon.statistiques.attaque}</strong>
    </div>

    <div class="mini-stat">
        <span class="mini-stat-nom">DEF</span>
        <strong>${dragon.statistiques.defense}</strong>
    </div>

    <div class="mini-stat">
        <span class="mini-stat-nom">END</span>
        <strong>${dragon.statistiques.endurance}</strong>
    </div>

    <div class="mini-stat">
        <span class="mini-stat-nom">TAI</span>
        <strong>${dragon.statistiques.taille}</strong>
    </div>

    <div class="mini-stat">
        <span class="mini-stat-nom">INT</span>
        <strong>${dragon.statistiques.intelligence}</strong>
    </div>

    <div class="mini-stat">
        <span class="mini-stat-nom">MAG</span>
        <strong>${dragon.statistiques.magie}</strong>
    </div>

    <div class="mini-stat">
        <span class="mini-stat-nom">VIT</span>
        <strong>${dragon.statistiques.vitesse}</strong>
    </div>

</div>

        <div class="apparence-carte">

    <div class="ligne-apparence">

        <span>
            Écailles :
        </span>

        <span
            class="pastille-couleur ${obtenirClassePastilleEcailles(dragon)}"
            style="background-color: ${dragon.apparence.ecailles};"
        ></span>

    </div>


    <div class="ligne-apparence">

        <span>
            Yeux :
        </span>

        ${genererAffichageYeux(dragon)}

    </div>

</div>        
				
				 <button
                    class="bouton-fiche"
                    data-id="${dragon.id}"
                >
                    Voir la fiche
                </button>

            </div>
                `;
    });


    const boutonsFiche =
        document.querySelectorAll(
            ".bouton-fiche"
        );


    boutonsFiche.forEach(function (bouton) {

        bouton.addEventListener(
            "click",
            function () {

                const idDragon =
                    bouton.dataset.id;


                const dragon =
                    collectionDragons.find(
                        function (dragon) {

                            return dragon.id === idDragon;

                        }
                    );


                afficherFicheDetaillee(dragon);

            }
        );

    });
	
}

// =================================
// FILTRES ET TRI DE L'ÉLEVAGE
// =================================

document
    .getElementById("recherche-dragon")
    .addEventListener(
        "input",
        afficherCollection
    );


document
    .getElementById("filtre-espece")
    .addEventListener(
        "change",
        afficherCollection
    );


document
    .getElementById("filtre-sexe")
    .addEventListener(
        "change",
        afficherCollection
    );

    document
    .getElementById("filtre-couleur")
    .addEventListener(
        "change",
        afficherCollection
    );


document
    .getElementById("filtre-rarete")
    .addEventListener(
        "change",
        afficherCollection
    );

document
    .getElementById("tri-dragons")
    .addEventListener(
        "change",
        afficherCollection
    );

const boutonGeneration =
    document.getElementById("bouton-generation");


boutonGeneration.addEventListener("click", function () {
	if (!depenserAction()) {

    alert(
        "Tu n'as plus d'action disponible aujourd'hui."
    );

    return;
}

    dragonsSauvagesActuels = [
        creerDragonAleatoire(),
        creerDragonAleatoire(),
        creerDragonAleatoire()
    ];

    afficherDragonsSauvages();

});

function obtenirParentsFiltres(sexe) {

    const recherche =
        document.getElementById("recherche-parent")
            .value.trim().toLowerCase();

    const filtreEspece =
        document.getElementById("filtre-espece-parent").value;

    const tri =
        document.getElementById("tri-parents").value;

    let dragons =
        collectionDragons.filter(
            dragon => dragon.sexe === sexe
        );

    if (recherche !== "") {

        dragons = dragons.filter(
            dragon => dragon.nom.toLowerCase().includes(recherche)
        );

    }

    if (filtreEspece !== "toutes") {

        dragons = dragons.filter(
            dragon => dragon.espece === filtreEspece
        );

    }

    if (tri === "score-desc") {

        dragons.sort(
            (a, b) =>
                calculerScorePerfection(b)
                - calculerScorePerfection(a)
        );

    } else if (tri === "score-asc") {

        dragons.sort(
            (a, b) =>
                calculerScorePerfection(a)
                - calculerScorePerfection(b)
        );

    } else if (tri === "generation-desc") {

        dragons.sort((a, b) => b.generation - a.generation);

    } else if (tri === "generation-asc") {

        dragons.sort((a, b) => a.generation - b.generation);

    } else if (tri === "nom-az") {

        dragons.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

    } else if (tri === "nom-za") {

        dragons.sort((a, b) => b.nom.localeCompare(a.nom, "fr"));

    }

    return dragons;
}

function rendreCarteParent(dragon, idSelectionne) {

    const selectionnee =
        dragon.id === idSelectionne;

    return `
        <button
            type="button"
            class="carte-parent ${selectionnee ? "selectionnee" : ""}"
            data-id="${dragon.id}"
        >
            <span class="carte-parent-nom">
                ${dragon.nom}
            </span>

            <span class="carte-parent-info">
                ${dragon.espece} · G${dragon.generation}
            </span>

            <span class="carte-parent-score">
                ★ ${calculerScorePerfection(dragon)}
            </span>
        </button>
    `;
}

function afficherListeParents(sexe, idListe, idSelectionne) {

    const zone =
        document.getElementById(idListe);

    const dragons =
        obtenirParentsFiltres(sexe);

    zone.classList.remove("vue-grille", "vue-liste");
    zone.classList.add(
        vueParents === "liste" ? "vue-liste" : "vue-grille"
    );

    if (dragons.length === 0) {

        zone.innerHTML = `
            <p class="liste-parents-vide">
                Aucun dragon ne correspond aux critères.
            </p>
        `;

        return;

    }

    zone.innerHTML =
        dragons
            .map(dragon => rendreCarteParent(dragon, idSelectionne))
            .join("");

    zone.querySelectorAll(".carte-parent").forEach(function (carte) {

        carte.addEventListener("click", function () {

            if (sexe === "Mâle") {

                idPereSelectionne = carte.dataset.id;

            } else {

                idMereSelectionne = carte.dataset.id;

            }

            afficherParentsDisponibles();

        });

    });

}

function afficherParentsDisponibles() {

    document.getElementById("compteur-peres").textContent =
        "(" + obtenirParentsFiltres("Mâle").length + ")";

    document.getElementById("compteur-meres").textContent =
        "(" + obtenirParentsFiltres("Femelle").length + ")";

    afficherListeParents("Mâle", "liste-peres", idPereSelectionne);
    afficherListeParents("Femelle", "liste-meres", idMereSelectionne);

    afficherApercuParent(idPereSelectionne, "apercu-pere");
    afficherApercuParent(idMereSelectionne, "apercu-mere");

    const boutonComparer =
        document.getElementById("bouton-comparer-parents");

    boutonComparer.disabled =
        idPereSelectionne === "" || idMereSelectionne === "";

    if (idPereSelectionne === "" || idMereSelectionne === "") {

        document.getElementById(
            "panneau-comparaison-parents"
        ).innerHTML = "";

    }

}

function afficherApercuParent(
    idDragon,
    idZone
) {

    const zone =
        document.getElementById(idZone);


    if (idDragon === "") {

        zone.innerHTML = "";

        return;
    }


    const dragon =
        collectionDragons.find(
            function (dragon) {

                return dragon.id === idDragon;

            }
        );


    if (!dragon) {

        zone.innerHTML = "";

        return;
    }


    zone.innerHTML = `

        <div class="carte-dragon">

            <div class="entete-carte-dragon">

                <h3>
                    ${dragon.nom}
                </h3>

                <span>
                    ${dragon.sexe === "Mâle" ? "♂" : "♀"}
                </span>

            </div>


            <p>
                ${dragon.espece}
                ·
                G${dragon.generation}
            </p>


            <div class="apparence-dragon">

                <div class="ligne-apparence">

                    <span>
                        Écailles :
                    </span>

                    <span
                        class="pastille-couleur ${obtenirClassePastilleEcailles(dragon)}"
                        style="background-color: ${dragon.apparence.ecailles};"
                    ></span>

                </div>


                <div class="ligne-apparence">

                    <span>
                        Yeux :
                    </span>

                    ${genererAffichageYeux(dragon)}

                </div>

            </div>


            <button
                class="bouton-fiche-parent"
                type="button"
                data-id="${dragon.id}"
>
                Voir la fiche
            </button>

        </div>
    `;


    const bouton =
    zone.querySelector(
        ".bouton-fiche-parent"
    );


bouton.onclick =
    function () {

        const idDragon =
            bouton.dataset.id;


        const dragonSelectionne =
            collectionDragons.find(
                function (dragonCollection) {

                    return (
                        dragonCollection.id
                        === idDragon
                    );

                }
            );


        if (!dragonSelectionne) {
            return;
        }


        afficherFicheDetaillee(
            dragonSelectionne
        );

    };

}

document
    .getElementById("recherche-parent")
    .addEventListener("input", afficherParentsDisponibles);

document
    .getElementById("filtre-espece-parent")
    .addEventListener("change", afficherParentsDisponibles);

document
    .getElementById("tri-parents")
    .addEventListener("change", afficherParentsDisponibles);

document
    .getElementById("bouton-vue-grille")
    .addEventListener("click", function () {

        vueParents = "grille";

        this.classList.add("actif");
        this.setAttribute("aria-pressed", "true");

        document.getElementById("bouton-vue-liste")
            .classList.remove("actif");
        document.getElementById("bouton-vue-liste")
            .setAttribute("aria-pressed", "false");

        afficherParentsDisponibles();

    });

document
    .getElementById("bouton-vue-liste")
    .addEventListener("click", function () {

        vueParents = "liste";

        this.classList.add("actif");
        this.setAttribute("aria-pressed", "true");

        document.getElementById("bouton-vue-grille")
            .classList.remove("actif");
        document.getElementById("bouton-vue-grille")
            .setAttribute("aria-pressed", "false");

        afficherParentsDisponibles();

    });

document
    .getElementById("bouton-comparer-parents")
    .addEventListener("click", afficherComparaisonParents);

function afficherComparaisonParents() {

    const panneau =
        document.getElementById("panneau-comparaison-parents");

    if (idPereSelectionne === "" || idMereSelectionne === "") {

        panneau.innerHTML = "";
        return;

    }

    const pere = collectionDragons.find(
        dragon => dragon.id === idPereSelectionne
    );

    const mere = collectionDragons.find(
        dragon => dragon.id === idMereSelectionne
    );

    if (!pere || !mere) {

        panneau.innerHTML = "";
        return;

    }

    const statsAComparer = [
        { cle: "attaque", label: "Attaque" },
        { cle: "defense", label: "Défense" },
        { cle: "endurance", label: "Endurance" },
        { cle: "taille", label: "Taille" },
        { cle: "intelligence", label: "Intelligence" },
        { cle: "magie", label: "Magie" },
        { cle: "vitesse", label: "Vitesse" }
    ];

    const lignes =
        statsAComparer.map(function (stat) {

            const valeurPere = pere.statistiques[stat.cle];
            const valeurMere = mere.statistiques[stat.cle];

            const classePere =
                valeurPere > valeurMere ? "meilleure-valeur" : "";

            const classeMere =
                valeurMere > valeurPere ? "meilleure-valeur" : "";

            return `
                <div class="ligne-comparaison">
                    <span class="comparaison-label">${stat.label}</span>
                    <strong class="${classePere}">${valeurPere}</strong>
                    <strong class="${classeMere}">${valeurMere}</strong>
                </div>
            `;

        }).join("");

    panneau.innerHTML = `
        <div class="carte-comparaison">

            <div class="entete-comparaison">
                <span></span>
                <span>${pere.nom} ♂</span>
                <span>${mere.nom} ♀</span>
            </div>

            ${lignes}

            <div class="ligne-comparaison ligne-comparaison-score">
                <span class="comparaison-label">Score total</span>
                <strong>${calculerScorePerfection(pere)}</strong>
                <strong>${calculerScorePerfection(mere)}</strong>
            </div>

        </div>
    `;

}

function reproduireDragons() {

    if (oeufEnAttente === true) {

        alert(
            "Tu dois d'abord décider du sort du nouveau-né actuel."
        );

        return;
    }

    const idPere =
        idPereSelectionne;

    const idMere =
        idMereSelectionne;


    if (idPere === "" || idMere === "") {

        alert("Tu dois choisir un père et une mère.");

        return;
    }


    const pere = collectionDragons.find(
        dragon => dragon.id === idPere
    );

    const mere = collectionDragons.find(
        dragon => dragon.id === idMere
    );


    if (pere.espece !== mere.espece) {

        alert(
            "Ces deux dragons ne sont pas de la même espèce."
        );

        return;
    }

const modeReproduction =
    document.querySelector(
        'input[name="mode-reproduction"]:checked'
    ).value;

const coutReproduction =
    modeReproduction === "ciblee"
        ? 2
        : 1;

let statistiqueCiblee = null;

if (modeReproduction === "ciblee") {

    const choixStatistique =
        document.querySelector(
            'input[name="statistique-ciblee"]:checked'
        );

    if (!choixStatistique) {

        alert(
            "Tu dois choisir une statistique à transmettre."
        );

        return;
    }

    statistiqueCiblee =
        choixStatistique.value;
}


if (actionsRestantes < coutReproduction) {

    alert(
        modeReproduction === "ciblee"
            ? "La transmission ciblée nécessite 2 actions."
            : "Tu n'as plus d'action disponible."
    );

    return;
}


for (
    let i = 0;
    i < coutReproduction;
    i++
) {

    depenserAction();

}

    const bebe = creerBebe(
    pere,
    mere,
    statistiqueCiblee
);

    incrementerProgressionMission("faire_reproduction");

    // "Obtenir un œuf" se compte dès l'éclosion, avant
    // même la décision de le garder ou de le relâcher.

    incrementerProgressionMission("obtenir_deux_oeufs");

    if (
        bebe.rareteEsthetique
        && bebe.rareteEsthetique.etoiles >= 2
    ) {

        incrementerProgressionMission("oeuf_peu_commun");

    }

    oeufEnAttente = true;
     mettreAJourBoutonsActions();

    afficherOeuf(bebe);

    idPereSelectionne = "";
    idMereSelectionne = "";
    document.getElementById("panneau-comparaison-parents").innerHTML = "";

    afficherParentsDisponibles();
}

function transmettreGene(genesParent) {

    return choisirAuHasard(
        genesParent
    );
}

console.log("VERSION MUTATION CHARGÉE");

function appliquerMutation(
    genes,
    generationMoyenne
) {

    // Chance de mutation :
    // 1 % par génération
    // maximum 35 %

    const chanceMutation = Math.min(
    generationMoyenne,
    35
);

    if (
        nombreAleatoire(1,100)
        > chanceMutation
    ) {

        return null;

    }


    const genesModifiables = [];


    for (const statistique in genes) {

        for (
            let i = 0;
            i < 2;
            i++
        ) {

            if (
                genes[statistique][i]
                < 20
            ) {

                genesModifiables.push({

                    statistique,

                    index:i

                });

            }

        }

    }


    if (
        genesModifiables.length
        === 0
    ) {

        return null;

    }

    genesModifiables.sort(

    (a,b)=>

    (

        genes[b.statistique][b.index]

        -

        genes[a.statistique][a.index]

    )

);

    const meilleureValeur =
    genes[
        genesModifiables[0].statistique
    ][
        genesModifiables[0].index
    ];

const meilleursGenes =
    genesModifiables.filter(g =>
        genes[g.statistique][g.index] === meilleureValeur
    );

const cible =
    choisirAuHasard(
        meilleursGenes
    );


    const ancienneValeur =
        genes[
            cible.statistique
        ][
            cible.index
        ];


    genes[
        cible.statistique
    ][
        cible.index
    ]++;


    return {

    type: "amélioration",

    statistique: cible.statistique,

    ancienGene: ancienneValeur,

    nouveauGene: ancienneValeur + 1,

    texte:
        `${cible.statistique.toUpperCase()} : ${ancienneValeur} → ${ancienneValeur + 1}`

};

}

function heriterFamilleCouleur(
    famillePere,
    familleMere
) {

    if (famillePere === familleMere) {

        return famillePere;

    }


    return choisirAuHasard([
        famillePere,
        familleMere
    ]);
}

function heriterNuance(
    nuancePere,
    nuanceMere
) {

    const moyenne =
        Math.round(
            (nuancePere + nuanceMere) / 2
        );


    const variation =
        nombreAleatoire(-15, 15);


    return Math.max(
        0,
        Math.min(
            100,
            moyenne + variation
        )
    );
}

function genererMutationEsthetiqueBebe(
    pere,
    mere
) {

    const mutationPere =
        pere.apparence.mutationEsthetique;

    const mutationMere =
        mere.apparence.mutationEsthetique;


    const mutationsPossibles = [
        "albinisme",
        "iridescence",
        "heterochromie",
        "opalescence"
    ];


    const mutationsReussies = [];


    mutationsPossibles.forEach(
        function (mutation) {

            const parentPorteur =
                mutationPere === mutation
                || mutationMere === mutation;


            const chance =
                parentPorteur
                    ? 15
                    : 1;


            const tirage =
                nombreAleatoire(1, 100);


            if (tirage <= chance) {

                mutationsReussies.push(
                    mutation
                );

            }

        }
    );

	console.log(
    "TEST MUTATIONS :",
    {
        mutationPere:
            mutationPere,

        mutationMere:
            mutationMere,

        mutationsReussies:
            mutationsReussies
    }
);

    if (mutationsReussies.length === 0) {

        return null;

    }


    return choisirAuHasard(
        mutationsReussies
    );
}

function genererSecondOeilHeterochromie(
    famillePremierOeil
) {

    const famillesPossibles = [
        "vert",
        "rouge",
        "bleu",
        "brun",
        "orange",
        "blanc",
        "noir",
        "or"
    ];


    const famillesDisponibles =
        famillesPossibles.filter(
            function (famille) {

                return famille
                    !== famillePremierOeil;

            }
        );


    const familleSecondOeil =
        choisirAuHasard(
            famillesDisponibles
        );


    const nuanceSecondOeil =
        nombreAleatoire(1, 100);


    const secondOeil =
        convertirCouleurEnRgb(
            familleSecondOeil,
            nuanceSecondOeil
        );


    return {
        familleSecondOeil:
            familleSecondOeil,

        nuanceSecondOeil:
            nuanceSecondOeil,

        secondOeil:
            secondOeil
    };
}

function genererApparenceBebe(
    pere,
    mere
) {
	
	const mutationEsthetique =
    genererMutationEsthetiqueBebe(
        pere,
        mere
    );

    const familleEcailles =
        heriterFamilleCouleur(
            pere.apparence.familleEcailles,
            mere.apparence.familleEcailles
        );


    const nuanceEcailles =
        heriterNuance(
            pere.apparence.nuanceEcailles,
            mere.apparence.nuanceEcailles
        );


    const familleYeux =
        heriterFamilleCouleur(
            pere.apparence.familleYeux,
            mere.apparence.familleYeux
        );


    const nuanceYeux =
        heriterNuance(
            pere.apparence.nuanceYeux,
            mere.apparence.nuanceYeux
        );

	    let couleurEcaillesVisible =
        convertirCouleurEnRgb(
            familleEcailles,
            nuanceEcailles
        );


    let couleurYeuxVisible =
        convertirCouleurEnRgb(
            familleYeux,
            nuanceYeux
        );


    if (
        mutationEsthetique === "albinisme"
    ) {

        couleurEcaillesVisible =
            "rgb(242, 235, 220)";

        couleurYeuxVisible =
            "rgb(185, 45, 55)";

    }

    if (
    mutationEsthetique === "opalescence"
) {

    couleurEcaillesVisible =
        "rgb(225, 220, 235)";

}
	
	if (
    mutationEsthetique === "iridescence"
) {

    couleurEcaillesVisible =
        "rgb(175, 205, 210)";

}
	
	let secondOeilHeterochromie =
    null;


if (
    mutationEsthetique
        === "heterochromie"
) {

    secondOeilHeterochromie =
        genererSecondOeilHeterochromie(
            familleYeux
        );

}

    return {

        familleEcailles:
            familleEcailles,

        nuanceEcailles:
            nuanceEcailles,

        ecailles:
			couleurEcaillesVisible,

        familleYeux:
            familleYeux,

        nuanceYeux:
            nuanceYeux,

        yeux:
			couleurYeuxVisible,
			
		familleSecondOeil:
    secondOeilHeterochromie
        ? secondOeilHeterochromie
            .familleSecondOeil
        : null,

nuanceSecondOeil:
    secondOeilHeterochromie
        ? secondOeilHeterochromie
            .nuanceSecondOeil
        : null,

secondOeil:
    secondOeilHeterochromie
        ? secondOeilHeterochromie
            .secondOeil
        : null,

        mutationEsthetique:
            mutationEsthetique

    };
}

function nettoyerGenealogie() {

    for (const dragon of collectionDragons) {

        if (!dragon.parents) {
            continue;
        }

        for (const role of ["pere", "mere"]) {

            const parent = dragon.parents[role];

            if (!parent) {
                continue;
            }

            delete parent.parents;

        }

    }

}

function creerEmpreinteGenealogique(dragon) {

    if (!dragon) {
        return null;
    }

    return {

        id: dragon.id,

        nom: dragon.nom,

        espece: dragon.espece,

        sexe: dragon.sexe,

        generation: dragon.generation,

        apparence:
            dragon.apparence
                ? structuredClone(dragon.apparence)
                : null

    };

}

function resoudreAncetre(empreinte) {

    if (!empreinte) {
        return null;
    }

    const dragonVivant =
        collectionDragons.find(
            dragon => dragon.id === empreinte.id
        );

    if (dragonVivant) {
        return dragonVivant;
    }

    return empreinte;

}

function construireArbreGenealogique(
    dragon,
    profondeurMax,
    profondeurActuelle = 0
) {

    if (!dragon) {
        return null;
    }


    const noeud = {

        dragon: dragon,

        pere: null,

        mere: null

    };


    if (
        profondeurActuelle
        >= profondeurMax
    ) {

        return noeud;

    }


    if (
    !dragon.parents ||
    (
        !dragon.parents.pere &&
        !dragon.parents.mere
    )
) {
    return noeud;
}

const pere =
    resoudreAncetre(
        dragon.parents.pere
    );

const mere =
    resoudreAncetre(
        dragon.parents.mere
    );

    noeud.pere =
        construireArbreGenealogique(
            pere,
            profondeurMax,
            profondeurActuelle + 1
        );


    noeud.mere =
        construireArbreGenealogique(
            mere,
            profondeurMax,
            profondeurActuelle + 1
        );


    return noeud;
}

function creerCarteGenealogique(noeud) {

    if (!noeud || !noeud.dragon) {

        return `
            <div class="carte-genealogique inconnue">
                <span>Ancêtre inconnu</span>
            </div>
        `;
    }


    const dragon =
        noeud.dragon;


    return `
        <div
            class="carte-genealogique"
            data-dragon-id="${dragon.id}"
        >

            <strong>
                ${dragon.nom}
            </strong>

            <span>
                ${dragon.sexe === "Mâle" ? "♂" : "♀"}
                ·
                G${dragon.generation}
            </span>

            <small>
                ${dragon.espece}
            </small>

        <div class="couleurs-genealogie">

    <span
        class="pastille-couleur"
        style="background-color: ${dragon.apparence?.ecailles || "#555"};"
        title="Écailles"
    ></span>

    <span
        class="pastille-couleur"
        style="background-color: ${dragon.apparence?.yeux || "#555"};"
        title="Yeux"
    ></span>

</div>

        </div>
    `;
}

function afficherGenealogie(dragon) {

    const fenetre =
        document.getElementById(
            "fenetre-genealogie"
        );

    const fond =
        document.getElementById(
            "fond-genealogie"
        );

    const contenu =
        document.getElementById(
            "contenu-genealogie"
        );

    const titre =
        document.getElementById(
            "titre-genealogie"
        );


    const arbre =
        construireArbreGenealogique(
            dragon,
            2
        );


    titre.textContent =
        "Généalogie de "
        + dragon.nom;


    contenu.innerHTML = `

         <svg
            id="lignes-genealogie"
            class="lignes-genealogie"
            aria-hidden="true"
        ></svg>

        <div class="generation-genealogie">

            ${creerCarteGenealogique(
                arbre.dragon
                    ? arbre
                    : null
            )}

        </div>


        <div class="generation-genealogie">

            ${creerCarteGenealogique(
                arbre.pere
            )}

            ${creerCarteGenealogique(
                arbre.mere
            )}

        </div>


        <div class="generation-genealogie">

            ${creerCarteGenealogique(
                arbre.pere
                    ? arbre.pere.pere
                    : null
            )}

            ${creerCarteGenealogique(
                arbre.pere
                    ? arbre.pere.mere
                    : null
            )}

            ${creerCarteGenealogique(
                arbre.mere
                    ? arbre.mere.pere
                    : null
            )}

            ${creerCarteGenealogique(
                arbre.mere
                    ? arbre.mere.mere
                    : null
            )}

        </div>

    `;

    const cartes =
    contenu.querySelectorAll(
        ".carte-genealogique[data-dragon-id]"
    );


cartes.forEach(
    function (carte) {

        const idDragon =
            carte.dataset.dragonId;


        const dragonCollection =
            collectionDragons.find(
                function (dragon) {

                    return (
                        dragon.id
                        === idDragon
                    );

                }
            );


        if (!dragonCollection) {

            carte.classList.add(
                "historique"
            );

            return;
        }


        // Le dragon racine est déjà celui
        // dont la fiche est ouverte.

        if (
            dragonCollection.id
            === dragon.id
        ) {

            carte.classList.add(
                "racine"
            );

            return;
        }


        carte.classList.add(
            "cliquable"
        );


        carte.addEventListener(
            "click",
            function () {

                fermerGenealogie();

                afficherFicheDetaillee(
                    dragonCollection
                );

            }
        );

    }
);

    fenetre.classList.add(
        "ouverte"
    );

    fond.classList.add(
        "ouvert"
    );

    fenetre.setAttribute(
        "aria-hidden",
        "false"
    );

    requestAnimationFrame(
    function () {

        tracerLignesGenealogie();

    }
);
}

function fermerGenealogie() {

    const fenetre =
        document.getElementById(
            "fenetre-genealogie"
        );

    const fond =
        document.getElementById(
            "fond-genealogie"
        );

    fenetre.classList.remove(
        "ouverte"
    );

    fond.classList.remove(
        "ouvert"
    );

    fenetre.setAttribute(
        "aria-hidden",
        "true"
    );
}

function tracerLignesGenealogie() {

    const contenu =
        document.getElementById(
            "contenu-genealogie"
        );

    const svg =
        document.getElementById(
            "lignes-genealogie"
        );

    const generations =
        contenu.querySelectorAll(
            ".generation-genealogie"
        );


    if (
        !svg
        || generations.length < 3
    ) {
        return;
    }


    svg.innerHTML = "";


    const rectangleContenu =
        contenu.getBoundingClientRect();


    svg.setAttribute(
        "width",
        contenu.scrollWidth
    );

    svg.setAttribute(
        "height",
        contenu.scrollHeight
    );


    function centreDroit(element) {

        const rectangle =
            element.getBoundingClientRect();

        return {

            x:
                rectangle.right
                - rectangleContenu.left,

            y:
                rectangle.top
                - rectangleContenu.top
                + rectangle.height / 2

        };
    }


    function centreGauche(element) {

        const rectangle =
            element.getBoundingClientRect();

        return {

            x:
                rectangle.left
                - rectangleContenu.left,

            y:
                rectangle.top
                - rectangleContenu.top
                + rectangle.height / 2

        };
    }


    function tracerBranche(
        parent,
        enfants
    ) {

        if (!parent) {
            return;
        }


        const depart =
            centreDroit(parent);


        const arrivees =
            enfants
                .filter(Boolean)
                .map(centreGauche);


        if (arrivees.length === 0) {
            return;
        }


        const xJonction =
            (
                depart.x
                + Math.min(
                    ...arrivees.map(
                        point => point.x
                    )
                )
            ) / 2;


        let chemin =
            `M ${depart.x} ${depart.y} `
            + `H ${xJonction} `;


        arrivees.forEach(
            function (arrivee) {

                chemin +=
                    `M ${xJonction} ${depart.y} `
                    + `V ${arrivee.y} `
                    + `H ${arrivee.x} `;

            }
        );


        const path =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );


        path.setAttribute(
            "d",
            chemin
        );


        svg.appendChild(
            path
        );

    }


    const dragon =
        generations[0]
            .querySelectorAll(
                ".carte-genealogique"
            );


    const parents =
        generations[1]
            .querySelectorAll(
                ".carte-genealogique"
            );


    const grandsParents =
        generations[2]
            .querySelectorAll(
                ".carte-genealogique"
            );


    tracerBranche(
        dragon[0],
        [
            parents[0],
            parents[1]
        ]
    );


    tracerBranche(
        parents[0],
        [
            grandsParents[0],
            grandsParents[1]
        ]
    );


    tracerBranche(
        parents[1],
        [
            grandsParents[2],
            grandsParents[3]
        ]
    );
}

function creerBebe(
    pere,
    mere,
    statistiqueCiblee = null
) {

function transmettre(
    genesParent,
    statistique
) {

    if (
        statistique ===
        statistiqueCiblee
    ) {

        return Math.max(
            ...genesParent
        );

    }

    const meilleurGene =
        Math.max(...genesParent);

    const autreGene =
        Math.min(...genesParent);

    const generationMoyenne =
        Math.round(
            (
                pere.generation
                +
                mere.generation
            ) / 2
        );

    const chanceBonGene =
        Math.min(
            50,
            generationMoyenne
        );

    if (
        nombreAleatoire(1,100)
        <= chanceBonGene
    ) {

        return meilleurGene;

    }

    return choisirAuHasard([

        meilleurGene,

        autreGene

    ]);

}

    const genes = {

    attaque: [
        transmettre(
            pere.genes.attaque,
            "attaque"
        ),

        transmettre(
            mere.genes.attaque,
            "attaque"
        )
    ],


    defense: [
        transmettre(
            pere.genes.defense,
            "defense"
        ),

        transmettre(
            mere.genes.defense,
            "defense"
        )
    ],


    endurance: [
        transmettre(
            pere.genes.endurance,
            "endurance"
        ),

        transmettre(
            mere.genes.endurance,
            "endurance"
        )
    ],


    taille: [
        transmettre(
            pere.genes.taille,
            "taille"
        ),

        transmettre(
            mere.genes.taille,
            "taille"
        )
    ],


    intelligence: [
        transmettre(
            pere.genes.intelligence,
            "intelligence"
        ),

        transmettre(
            mere.genes.intelligence,
            "intelligence"
        )
    ],


    magie: [
        transmettre(
            pere.genes.magie,
            "magie"
        ),

        transmettre(
            mere.genes.magie,
            "magie"
        )
    ],


    vitesse: [
        transmettre(
            pere.genes.vitesse,
            "vitesse"
        ),

        transmettre(
            mere.genes.vitesse,
            "vitesse"
        )
    ]

};
	
	const generationMoyenne = Math.round(

    (
        pere.generation
        +
        mere.generation
    ) / 2

);

const mutation =
    appliquerMutation(

        genes,

        generationMoyenne

);

	console.log(
    "TEST IMMÉDIAT MUTATION :",
    mutation
);

    const bebe = {

        id: crypto.randomUUID(),

        nom: "Sans nom",

        espece: pere.espece,

        sexe: choisirAuHasard([
            "Mâle",
            "Femelle"
        ]),

        origine: "Élevage",

        generation:
            Math.max(
                pere.generation,
                mere.generation
            ) + 1,

        parents: {

            pere:
            creerEmpreinteGenealogique(
                pere
        ),

            mere:
            creerEmpreinteGenealogique(
                mere
        )

},

		genes: genes,

		mutation: mutation,

        statistiques: {

            attaque:
                calculerStatistique(
                    genes.attaque
                ),

            defense:
                calculerStatistique(
                    genes.defense
                ),

            endurance:
                calculerStatistique(
                    genes.endurance
                ),

            taille:
                calculerStatistique(
                    genes.taille
                ),

            intelligence:
                calculerStatistique(
                    genes.intelligence
                ),

            magie:
                calculerStatistique(
                    genes.magie
                ),

            vitesse:
                calculerStatistique(
                    genes.vitesse
                )

        },


        apparence:
    genererApparenceBebe(
        pere,
        mere
    )

    };
	
	bebe.rareteEsthetique =
    calculerRareteEsthetique(
        bebe.espece,
        bebe.apparence.familleEcailles,
        bebe.apparence.familleYeux,
        bebe.apparence.mutationEsthetique
    );

console.log(
    "PÈRE :",
    pere.nom,
    pere.genes
);

console.log(
    "MÈRE :",
    mere.nom,
    mere.genes
);

console.log(
    "BÉBÉ :",
    bebe.genes,
    bebe.statistiques
);

	if (mutation !== null) {

    console.log(
        "🧬 MUTATION DÉTECTÉE !",
        mutation
    );

}

    return bebe;
}

function afficherOeuf(bebe) {

    dragonActuel = bebe;

    const zoneOeuf =
        document.getElementById("zone-oeuf");

    let encartMutation = "";

if (bebe.mutation) {

    encartMutation = `

    <div class="encart-mutation">

        <div class="titre-mutation">

            🧬 Mutation génétique

        </div>

        <div class="contenu-mutation">

            ${bebe.mutation.texte}

        </div>

    </div>

    `;

}

    zoneOeuf.innerHTML = `

        <div class="oeuf">

            <div class="icone-oeuf">
                🥚
            </div>

            <h3>Un dragon est né !</h3>

            ${encartMutation}

            <p>
                <strong>Espèce :</strong>
                ${bebe.espece}
            </p>

            <p>
                <strong>Sexe :</strong>
                ${bebe.sexe}
            </p>

	    <p>
               <strong>Génération :</strong>
               G${bebe.generation}
            </p>

            <p>
               <strong>Père :</strong>
               ${bebe.parents.pere.nom}
               |
               <strong>Mère :</strong>
               ${bebe.parents.mere.nom}
            </p>

            <h4>Statistiques</h4>

            <p>Attaque : ${bebe.statistiques.attaque}</p>
            <p>Défense : ${bebe.statistiques.defense}</p>
            <p>Endurance : ${bebe.statistiques.endurance}</p>
            <p>Taille : ${bebe.statistiques.taille}</p>
            <p>Intelligence : ${bebe.statistiques.intelligence}</p>
            <p>Magie : ${bebe.statistiques.magie}</p>
            <p>Vitesse : ${bebe.statistiques.vitesse}</p>

            <h4>Apparence</h4>

            <p>
                Écailles :

                <span
                    class="pastille-couleur ${obtenirClassePastilleEcailles(bebe)}"
                    style="background-color: ${bebe.apparence.ecailles}">
                </span>
            </p>

            <p>
                Yeux :

				${genererAffichageYeux(bebe)}
            </p>

            <input
                type="text"
                id="nom-bebe"
                placeholder="Nom du nouveau-né"
                maxlength="20"
            >

            <button id="bouton-garder-bebe">
                Ajouter à l'élevage
            </button>

           <button id="bouton-relacher-bebe">
    		Relâcher le dragon
	   </button>

        </div>
    `;


    const boutonGarderBebe =
        document.getElementById("bouton-garder-bebe");


    boutonGarderBebe.addEventListener(
        "click",
        garderBebe
    );

    const boutonRelacherBebe =
       document.getElementById("bouton-relacher-bebe");

    boutonRelacherBebe.addEventListener(
       "click",
       relacherBebe
);
}

function garderBebe() {

    const champNom =
        document.getElementById("nom-bebe");

    const nomChoisi =
        champNom.value.trim();


    if (nomChoisi === "") {

        alert(
            "Tu dois donner un nom au nouveau-né."
        );

        return;
    }


    dragonActuel.nom = nomChoisi;

    collectionDragons.push(dragonActuel);
	
	statistiquesSucces.dragonsEleves++;
	sauvegarderPartie();
	verifierSucces();

    signalerDragonObtenu(dragonActuel, "reproduction");

    sauvegarderPartie();

    nettoyerGenealogie();

    dragonActuel = null;

    oeufEnAttente = false;

    mettreAJourBoutonsActions();


    afficherCollection();

    afficherParentsDisponibles();
	
	afficherDragonsEvaluables();


    const zoneOeuf =
        document.getElementById("zone-oeuf");


    zoneOeuf.innerHTML = `
        <p>
            Le nouveau dragon a rejoint ton élevage !
        </p>
    `;
}


function relacherBebe() {

    const confirmation = confirm(
        "Relâcher ce dragon ? Il sera définitivement perdu."
    );


    if (confirmation === false) {

        return;
    }


    dragonActuel = null;

    oeufEnAttente = false;

    mettreAJourBoutonsActions();


    const zoneOeuf =
        document.getElementById("zone-oeuf");


    zoneOeuf.innerHTML = `
        <p>
            Le dragon a été relâché.
        </p>
    `;
}

const boutonReproduction =
    document.getElementById("bouton-reproduction");


boutonReproduction.addEventListener(
    "click",
    reproduireDragons
);

const boutonRecommencer =
    document.getElementById("bouton-recommencer");


boutonRecommencer.addEventListener(
    "click",
    recommencerPartie
);

// =================================
// INTERFACE DE SAUVEGARDE
// =================================



const boutonCopierCode =
    document.getElementById(
        "bouton-copier-code"
    );


boutonCopierCode.addEventListener(
    "click",
    copierCodeSauvegarde
);


const boutonRecupererPartie =
    document.getElementById(
        "bouton-recuperer-partie"
    );


boutonRecupererPartie.addEventListener(
    "click",
    gererRecuperationPartie
);


const boutonExporterSauvegarde =
    document.getElementById(
        "bouton-exporter-sauvegarde"
    );


boutonExporterSauvegarde.addEventListener(
    "click",
    exporterSauvegarde
);


const boutonImporterSauvegarde =
    document.getElementById(
        "bouton-importer-sauvegarde"
    );


boutonImporterSauvegarde.addEventListener(
    "click",
    importerSauvegarde
);


const champCodeRecuperation =
    document.getElementById(
        "champ-code-recuperation"
    );


champCodeRecuperation.addEventListener(
    "keydown",
    function (evenement) {

        if (
            evenement.key === "Enter"
        ) {

            gererRecuperationPartie();

        }

    }
);

const boutonEvaluation =
    document.getElementById(
        "bouton-evaluation"
    );


boutonEvaluation.addEventListener(
    "click",
    evaluerDragon
);

const selectionDragonEvaluation =
    document.getElementById(
        "selection-dragon-evaluation"
    );


selectionDragonEvaluation.addEventListener(
    "change",
    choisirDragonAEvaluer
);

const boutonsNavigation =
    document.querySelectorAll(
        ".bouton-navigation"
    );


const ecransJeu =
    document.querySelectorAll(
        ".ecran-jeu"
    );


boutonsNavigation.forEach(
    function (bouton) {

        bouton.addEventListener(
            "click",
            function () {

                const idEcran =
                    bouton.dataset.ecran;


                // Masquer tous les écrans

                ecransJeu.forEach(
                    function (ecran) {

                        ecran.classList.remove(
                            "actif"
                        );

                    }
                );


                // Désactiver tous les boutons

                boutonsNavigation.forEach(
                    function (autreBouton) {

                        autreBouton.classList.remove(
                            "actif"
                        );

                    }
                );


                // Afficher l'écran demandé

                document.getElementById(
                    idEcran
                ).classList.add(
                    "actif"
                );


                // Marquer le bouton comme actif

                bouton.classList.add(
                    "actif"
                );


                // La bourse de dons vit côté serveur,
                // partagée entre joueurs : on la
                // rafraîchit à chaque fois qu'on ouvre
                // cet écran plutôt que de compter sur un
                // état mis en cache.

                if (idEcran === "ecran-dons") {

                    chargerEtAfficherDons();

                }

            }
        );

    }
);

// =================================
// FERMETURE DE LA GÉNÉALOGIE
// =================================

document
    .getElementById(
        "bouton-fermer-genealogie"
    )
    .addEventListener(
        "click",
        fermerGenealogie
    );


document
    .getElementById(
        "fond-genealogie"
    )
    .addEventListener(
        "click",
        fermerGenealogie
    );

mettreAJourInterfaceSauvegarde();

// Important : on ne touche pas aux missions/à l'argent ici.
// Tant que synchroniserPartieAuDemarrage() n'a pas chargé la
// vraie sauvegarde (locale ou distante), appeler quoi que ce
// soit qui déclenche sauvegarderPartie() écraserait la partie
// du joueur avec l'état par défaut (collection vide). Les
// missions/la boutique sont initialisées à l'intérieur
// d'appliquerDonneesSauvegarde(), une fois les vraies données
// en mémoire.

synchroniserPartieAuDemarrage();

document
    .querySelectorAll(
        'input[name="mode-reproduction"]'
    )
    .forEach(option => {

        option.addEventListener(
            "change",
            mettreAJourModeReproduction
        );

    });


function mettreAJourModeReproduction() {

    const modeSelectionne =
        document.querySelector(
            'input[name="mode-reproduction"]:checked'
        );

    const choixStatistique =
        document.getElementById(
            "choix-statistique-ciblee"
        );

    const transmissionCiblee =
        modeSelectionne.value === "ciblee";

    choixStatistique.hidden =
        !transmissionCiblee;
}