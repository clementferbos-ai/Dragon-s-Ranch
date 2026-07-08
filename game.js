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

function creerDonneesSauvegarde() {

    return {

        versionSauvegarde: 1,

        dateSauvegarde:
            new Date().toISOString(),

        collectionDragons:
            collectionDragons,

        succesDebloques:
            succesDebloques,

        statistiquesSucces:
            statistiquesSucces,

        actionsRestantes:
            actionsRestantes,

        dateDernierRenouvellement:
            dateDernierRenouvellement,
		
		heureDernierRenouvellement: 
			heureDernierRenouvellement

    };

}


function sauvegarderPartie() {

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

function exporterSauvegarde() {

    const donneesSauvegarde =
        creerDonneesSauvegarde();


    const contenu =
        JSON.stringify(
            donneesSauvegarde,
            null,
            2
        );


    const fichier =
        new Blob(
            [contenu],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            fichier
        );


    const lien =
        document.createElement(
            "a"
        );


    const date =
        new Date()
            .toISOString()
            .slice(0, 10);


    lien.href =
        url;


    lien.download =
        `sauvegarde-dragons-${date}.json`;


    document.body.appendChild(
        lien
    );


    lien.click();


    lien.remove();


    URL.revokeObjectURL(
        url
    );

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

stabiliser_heterochromie: {
    nom: "Deux regards, une lignée",
    description:
        "Obtenir un dragon G5 ou plus hétérochrome.",
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


    sauvegarderPartie();
	afficherResumeSucces();
	afficherListeSucces();


    console.log(
        "SUCCÈS DÉBLOQUÉ :",
        catalogueSucces[idSucces].nom
    );


    return true;
}

function obtenirTitreEleveur() {

    const points =
        calculerPointsSucces();


    if (points >= 50) {
        return "Légende draconique";
    }


    if (points >= 35) {
        return "Grand maître";
    }


    if (points >= 20) {
        return "Maître éleveur";
    }


    if (points >= 10) {
        return "Éleveur confirmé";
    }


    if (points >= 5) {
        return "Apprenti éleveur";
    }


    return "Éleveur novice";
}

function verifierSucces() {

    // =========================
    // COLLECTION
    // =========================

    const nombreDragons =
        collectionDragons.length;


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

collectionDragons.forEach(
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

collectionDragons.forEach(
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

collectionDragons.forEach(
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

    collectionDragons.forEach(
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
        collectionDragons.map(
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
                collectionDragons.some(
                    dragon =>
                        dragon.espece === espece
                        && dragon.sexe === "Mâle"
                );


            const possedeFemelle =
                collectionDragons.some(
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

                    return collectionDragons.some(
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

            return collectionDragons.some(
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
    collectionDragons.some(
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
    collectionDragons.filter(
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

            console.log(
                "Sauvegarde locale plus récente."
            );


            appliquerDonneesSauvegarde(
                sauvegardeLocale
            );


            await sauvegarderPartieDistante();

        }


        // 4. Sinon, la sauvegarde distante gagne.

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


            sauvegarderPartie();

        }

    }

}

function appliquerDonneesSauvegarde(
    sauvegarde
) {

    collectionDragons =
        sauvegarde.collectionDragons
        || [];


    succesDebloques =
        sauvegarde.succesDebloques
        || [];


    statistiquesSucces =
        sauvegarde.statistiquesSucces
        || {
            dragonsSauvagesCaptures: 0,
            dragonsEleves: 0
        };


    if (
        sauvegarde.actionsRestantes
        !== undefined
    ) {

        actionsRestantes =
            sauvegarde.actionsRestantes;

    }


    if (
        sauvegarde.dateDernierRenouvellement
        !== undefined
    ) {

        dateDernierRenouvellement =
            sauvegarde.dateDernierRenouvellement;

    }
	
	if (
		sauvegarde.heureDernierRenouvellement
		!== undefined
	) {
		
		heureDernierRenouvellement = 
		sauvegarde.heureDernierRenouvellement;
}


    verifierSucces();

    verifierRenouvellementActions();

    afficherActions();

    afficherCollection();

    afficherParentsDisponibles();

    afficherDragonsEvaluables();
	
	afficherResumeSucces();

	afficherListeSucces();

}

function chargerPartie() {

    const sauvegardeTexte =
        localStorage.getItem(
            "elevageDragons"
        );


    if (sauvegardeTexte !== null) {

        try {

            const sauvegarde =
                JSON.parse(
                    sauvegardeTexte
                );


            appliquerDonneesSauvegarde(
                sauvegarde
            );


            console.log(
                "SAUVEGARDE LOCALE CHARGÉE"
            );


            return;

        }

        catch (erreur) {

            console.error(
                "ÉCHEC DU CHARGEMENT LOCAL :",
                erreur
            );

        }

    }


    // Aucune sauvegarde locale :
    // on initialise simplement le jeu.

    verifierSucces();

    verifierRenouvellementActions();

    afficherActions();

    afficherCollection();

    afficherParentsDisponibles();

    afficherDragonsEvaluables();

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

    collectionDragons = [];
	
	succesDebloques = [];
	
	statistiquesSucces = {

    dragonsSauvagesCaptures: 0,

    dragonsEleves: 0

};
	
	actionsRestantes =
    MAX_ACTIONS_PAR_JOUR;

	dateDernierRenouvellement =
		obtenirDateAujourdhui();
	
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

function formaterNomCouleur(couleur) {

    return couleur.charAt(0).toUpperCase()
        + couleur.slice(1);
}

function obtenirClassePastilleEcailles(dragon) {

    if (
        dragon
        && dragon.apparence
        && dragon.apparence.mutationEsthetique
            === "iridescence"
    ) {

        return "pastille-iridescente";

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
        "heterochromie"
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

function obtenirDateAujourdhui() {

    const maintenant =
        new Date();


    const annee =
        maintenant.getFullYear();


    const mois =
        String(
            maintenant.getMonth() + 1
        ).padStart(2, "0");


    const jour =
        String(
            maintenant.getDate()
        ).padStart(2, "0");


    return `${annee}-${mois}-${jour}`;
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


    afficherActions();

    sauvegarderPartie();


    return true;
}

function couleurAleatoire() {

    const rouge = nombreAleatoire(0, 255);
    const vert = nombreAleatoire(0, 255);
    const bleu = nombreAleatoire(0, 255);

    return `rgb(${rouge}, ${vert}, ${bleu})`;
}

function faireVarierComposante(valeur) {

    const variation =
        nombreAleatoire(-15, 15);

    const resultat =
        valeur + variation;

    return Math.max(
        0,
        Math.min(255, resultat)
    );
}


function heriterCouleur(couleurPere, couleurMere) {

    const valeursPere =
        couleurPere.match(/\d+/g).map(Number);

    const valeursMere =
        couleurMere.match(/\d+/g).map(Number);

    const tirageHeritage =
        nombreAleatoire(1, 100);

    let rouge;
    let vert;
    let bleu;

    if (tirageHeritage <= 40) {

        rouge = valeursPere[0];
        vert = valeursPere[1];
        bleu = valeursPere[2];

    } else if (tirageHeritage <= 80) {

        rouge = valeursMere[0];
        vert = valeursMere[1];
        bleu = valeursMere[2];

    } else {

        rouge = Math.round(
            (valeursPere[0] + valeursMere[0]) / 2
        );

        vert = Math.round(
            (valeursPere[1] + valeursMere[1]) / 2
        );

        bleu = Math.round(
            (valeursPere[2] + valeursMere[2]) / 2
        );
    }

    rouge = faireVarierComposante(rouge);
    vert = faireVarierComposante(vert);
    bleu = faireVarierComposante(bleu);

    return `rgb(${rouge}, ${vert}, ${bleu})`;
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

function obtenirInterpretationNote(note) {

    const interpretations = {
        S: "Potentiel exceptionnel",
        A: "Potentiel remarquable",
        B: "Bon potentiel",
        C: "Potentiel moyen",
        D: "Potentiel faible",
        E: "Potentiel très faible",
        F: "Potentiel médiocre"
    };


    return (
        interpretations[note]
        || "Potentiel inconnu"
    );
}

function obtenirNomStatistique(statistique) {

    const noms = {
        attaque: "Attaque",
        defense: "Défense",
        endurance: "Endurance",
        taille: "Taille",
        intelligence: "Intelligence",
        magie: "Magie",
        vitesse: "Vitesse"
    };

    return noms[statistique];
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

    fiche.innerHTML = `

        <div class="fiche-detaillee">

            <div class="entete-fiche">

                <div class="identite-fiche">

                    <h2>
                        ${dragon.nom}
                    </h2>

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
                            ${formaterNomCouleur(
                                dragon.apparence.familleEcailles
                            )}
                        </strong>
                    </p>

                    <p>
                        <span>Yeux</span>

                        <strong>
                            ${formaterNomCouleur(
                                dragon.apparence.familleYeux
                            )}
                        </strong>
                    </p>

                    <small>
                        Ces couleurs restent transmissibles
                        à la descendance.
                    </small>

                </div>


                <div class="score-rarete-fiche">

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
                            ${formaterNomCouleur(
                                dragon.apparence.familleYeux
                            )}
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
            ${formaterNomCouleur(
                dragon.apparence.familleYeux
            )}
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
            ${formaterNomCouleur(
                dragon.apparence.familleYeux
            )}
        </strong>
    </p>

    <small>
        Cette couleur reste transmissible à la descendance.
    </small>

</div>


<div class="score-rarete-fiche">

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

                        <span class="etoiles-rarete">

                            ${genererEtoiles(
                                dragon.rareteEsthetique
                                    .etoiles
                            )}

                        </span>

                        <strong>

                            ${obtenirLibelleRarete(
                                dragon.rareteEsthetique
                                    .etoiles
                            )}

                        </strong>

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
                class="bouton-danger"
                type="button"
                onclick="relacherDragon('${dragon.id}')"
            >
                Relâcher ce dragon
            </button>
			
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

function afficherParentsDisponibles() {

    const selectionPere =
        document.getElementById("selection-pere");

    const selectionMere =
        document.getElementById("selection-mere");


    selectionPere.innerHTML = `
        <option value="">
            Choisir un mâle
        </option>
    `;

    selectionMere.innerHTML = `
        <option value="">
            Choisir une femelle
        </option>
    `;

    document.getElementById(
    "apercu-pere"
    ).innerHTML = "";


    document.getElementById(
    "apercu-mere"
    ).innerHTML = "";

    collectionDragons.forEach(function (dragon) {

        const option = `
            <option value="${dragon.id}">
                ${dragon.nom} — ${dragon.espece}
            </option>
        `;


        if (dragon.sexe === "Mâle") {

            selectionPere.innerHTML += option;

        }


        if (dragon.sexe === "Femelle") {

            selectionMere.innerHTML += option;

        }

    });
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
    .getElementById("selection-pere")
    .addEventListener(
        "change",
        function () {

            afficherApercuParent(
                this.value,
                "apercu-pere"
            );

        }
    );


document
    .getElementById("selection-mere")
    .addEventListener(
        "change",
        function () {

            afficherApercuParent(
                this.value,
                "apercu-mere"
            );

        }
    );

function reproduireDragons() {

    if (oeufEnAttente === true) {

        alert(
            "Tu dois d'abord décider du sort du nouveau-né actuel."
        );

        return;
    }

    const idPere =
        document.getElementById("selection-pere").value;

    const idMere =
        document.getElementById("selection-mere").value;


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

if (!depenserAction()) {

    alert(
        "Tu n'as plus d'action disponible aujourd'hui."
    );

    return;
}

    const bebe = creerBebe(pere, mere);

    oeufEnAttente = true;
     mettreAJourBoutonsActions();

    afficherOeuf(bebe);
}

function transmettreGene(genesParent) {

    return choisirAuHasard(
        genesParent
    );
}

console.log("VERSION MUTATION CHARGÉE");

function appliquerMutation(genes) {

    const tirage =
		nombreAleatoire(1, 100);


    let typeMutation = null;
    let amplitude = 0;


    if (tirage <= 2) {

        typeMutation = "majeure";
        amplitude = 2;

    } else if (tirage <= 10) {

        typeMutation = "mineure";
        amplitude = 1;

    } else {

        return null;
    }


    const statistiquesPossibles = [
        "attaque",
        "defense",
        "endurance",
        "taille",
        "intelligence",
        "magie",
        "vitesse"
    ];


    const statistiqueChoisie =
        choisirAuHasard(
            statistiquesPossibles
        );


    const indexGene =
        nombreAleatoire(0, 1);


    const direction =
        choisirAuHasard([
            -1,
            1
        ]);


    const ancienneValeur =
        genes[statistiqueChoisie][indexGene];


    const nouvelleValeur =
        Math.max(
            1,
            Math.min(
                20,
                ancienneValeur
                + direction * amplitude
            )
        );


    genes[statistiqueChoisie][indexGene] =
        nouvelleValeur;


    return {

        type: typeMutation,

        statistique:
            statistiqueChoisie,

        ancienGene:
            ancienneValeur,

        nouveauGene:
            nouvelleValeur,

        origineGene:
            indexGene === 0
                ? "père"
                : "mère"

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
        "heterochromie"
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

function creerEmpreinteGenealogique(dragon) {

    return {

        id: dragon.id,

        nom: dragon.nom,

        espece: dragon.espece,

        sexe: dragon.sexe,

        generation: dragon.generation,

        apparence: dragon.apparence
        ? structuredClone(dragon.apparence)
        : null,

        parents: dragon.parents
            ? structuredClone(dragon.parents)
            : null

    };
}

function resoudreAncetre(empreinte) {

    if (!empreinte) {
        return null;
    }


    const dragonVivant =
        collectionDragons.find(
            function (dragon) {

                return (
                    dragon.id
                    === empreinte.id
                );

            }
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


    if (!dragon.parents) {

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

function creerBebe(pere, mere) {

    const genes = {

        attaque: [
            transmettreGene(
                pere.genes.attaque
            ),

            transmettreGene(
                mere.genes.attaque
            )
        ],


        defense: [
            transmettreGene(
                pere.genes.defense
            ),

            transmettreGene(
                mere.genes.defense
            )
        ],


        endurance: [
            transmettreGene(
                pere.genes.endurance
            ),

            transmettreGene(
                mere.genes.endurance
            )
        ],


        taille: [
            transmettreGene(
                pere.genes.taille
            ),

            transmettreGene(
                mere.genes.taille
            )
        ],


        intelligence: [
            transmettreGene(
                pere.genes.intelligence
            ),

            transmettreGene(
                mere.genes.intelligence
            )
        ],


        magie: [
            transmettreGene(
                pere.genes.magie
            ),

            transmettreGene(
                mere.genes.magie
            )
        ],


        vitesse: [
            transmettreGene(
                pere.genes.vitesse
            ),

            transmettreGene(
                mere.genes.vitesse
            )
        ]

    };
	
	const mutation =
		appliquerMutation(genes);

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


    zoneOeuf.innerHTML = `

        <div class="oeuf">

            <div class="icone-oeuf">
                🥚
            </div>

            <h3>Un dragon est né !</h3>

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

    sauvegarderPartie();

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

synchroniserPartieAuDemarrage();