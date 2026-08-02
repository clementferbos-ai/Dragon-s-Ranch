// =========================================
// TEST DE NON-RÉGRESSION : CONSANGUINITÉ
// =========================================
//
// Vérifie :
//
//   1. calculerCoefficientParente() retrouve les valeurs de
//      référence de la génétique des pedigrees (frère/soeur
//      et parent-enfant = 0.5, demi-fratrie et grand-parent
//      = 0.25, cousins germains = 0.125, aucun lien = 0).
//   2. obtenirMalusConsanguinite() / obtenirNiveauConsanguinite()
//      restent cohérents et bornés.
//   3. creerBebe() applique bien un malus statistique en mode
//      libre pour un couple consanguin (test statistique sur
//      un grand nombre de tirages), SANS jamais empêcher la
//      reproduction.
//   4. Le mode ciblé (payé en actions) reste TOUJOURS garanti,
//      même pour un couple très consanguin : la consanguinité
//      ne doit jamais annuler un choix délibéré du joueur.
//
// Aucune dépendance externe : uniquement le module "vm"
// natif de Node. À lancer avec :
//
//     node test/consanguinite.test.mjs

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const cheminIci =
    path.dirname(
        fileURLToPath(import.meta.url)
    );

const cheminGameJs =
    path.join(
        cheminIci,
        "..",
        "game.js"
    );


// =========================================
// FAUX DOM MINIMAL
// =========================================

function creerElementFactice() {

    return {

        value: "",
        innerHTML: "",
        textContent: "",
        disabled: false,
        hidden: false,
        dataset: {},
        style: {
            setProperty() {}
        },

        classList: {
            add() {},
            remove() {},
            toggle() {},
            contains() {
                return false;
            }
        },

        addEventListener() {},
        removeEventListener() {},
        appendChild() {},
        focus() {},
        select() {},

        querySelector() {
            return null;
        },

        querySelectorAll() {
            return [];
        }

    };

}

function creerContexte() {

    let magasin = {};

    const stockage = {

        getItem(cle) {
            return cle in magasin ? magasin[cle] : null;
        },

        setItem(cle, valeur) {
            magasin[cle] = String(valeur);
        },

        removeItem(cle) {
            delete magasin[cle];
        }

    };

    const documentFactice = {

        getElementById() {
            return creerElementFactice();
        },

        querySelector() {
            return null;
        },

        querySelectorAll() {
            return [];
        },

        createElement() {
            return creerElementFactice();
        },

        addEventListener() {}

    };

    const contexte = {

        document: documentFactice,
        localStorage: stockage,

        navigator: {
            clipboard: {
                async writeText() {}
            }
        },

        crypto: {
            randomUUID() {
                return "uuid-" + Math.random();
            }
        },

        async fetch() {

            return {
                ok: false,
                async json() {
                    return { succes: false };
                }
            };

        },

        alert() {},

        confirm() {
            return true;
        },

        console,
        setTimeout,
        clearTimeout,
        Date,
        Math,
        JSON,
        Object,
        Array,
        Promise

    };

    contexte.structuredClone = structuredClone;

    contexte.window = contexte;
    contexte.globalThis = contexte;

    vm.createContext(contexte);

    return { contexte, stockage };

}

function ecrireVariable(contexte, nom, valeur) {

    contexte.__pont = valeur;

    vm.runInContext(
        `${nom} = __pont;`,
        contexte
    );

    delete contexte.__pont;

}

function chargerJeu() {

    const { contexte, stockage } =
        creerContexte();

    const code =
        fs.readFileSync(
            cheminGameJs,
            "utf8"
        );

    vm.runInContext(
        code,
        contexte,
        { filename: "game.js" }
    );

    ecrireVariable(contexte, "chargementInitialTermine", true);
    ecrireVariable(contexte, "collectionDragons", []);

    return { contexte, stockage };

}


// =========================================
// TEST 1 : COEFFICIENTS DE RÉFÉRENCE
// =========================================

function testCoefficientsDeReference() {

    const { contexte } = chargerJeu();

    function d(id, parents) {

        return {
            id: id,
            parents: parents || null
        };

    }

    const grandPere = d("gp");
    const grandMere = d("gm");

    const pereCommun =
        d("pere-commun", { pere: grandPere, mere: grandMere });

    const mereCommune =
        d("mere-commune");

    // --- Frère/soeur (partagent père ET mère) : 0.5 ---

    const frere =
        d("frere", { pere: pereCommun, mere: mereCommune });

    const soeur =
        d("soeur", { pere: pereCommun, mere: mereCommune });

    assert.equal(
        contexte.calculerCoefficientParente(frere, soeur),
        0.5,
        "frère/soeur (mêmes parents) doit donner 0.5"
    );

    // --- Parent-enfant : 0.5 ---

    assert.equal(
        contexte.calculerCoefficientParente(pereCommun, frere),
        0.5,
        "parent-enfant doit donner 0.5"
    );

    // --- Demi-frère/soeur (un seul parent commun) : 0.25 ---

    const autreMere = d("autre-mere");

    const demiFrere =
        d("demi-frere", { pere: pereCommun, mere: autreMere });

    assert.equal(
        contexte.calculerCoefficientParente(frere, demiFrere),
        0.25,
        "demi-fratrie (un seul parent commun) doit donner 0.25"
    );

    // --- Grand-parent / petit-enfant : 0.25 ---

    assert.equal(
        contexte.calculerCoefficientParente(grandPere, frere),
        0.25,
        "grand-parent/petit-enfant doit donner 0.25"
    );

    // --- Cousins germains (2 grands-parents communs) : 0.125 ---

    const oncle =
        d("oncle", { pere: grandPere, mere: grandMere });

    const tante =
        d("tante-par-alliance");

    const cousin =
        d("cousin", { pere: oncle, mere: tante });

    assert.equal(
        contexte.calculerCoefficientParente(frere, cousin),
        0.125,
        "cousins germains doit donner 0.125"
    );

    // --- Aucun lien connu : 0 ---

    const etranger1 = d("etranger-1");
    const etranger2 = d("etranger-2");

    assert.equal(
        contexte.calculerCoefficientParente(etranger1, etranger2),
        0,
        "deux dragons sans ancêtre commun connu doivent "
        + "donner 0"
    );

    // --- Se reproduire avec soi-même (garde-fou, ne devrait "
    // jamais arriver dans l'UI, mais ne doit pas planter) ---

    assert.equal(
        contexte.calculerCoefficientParente(frere, frere),
        0,
        "un dragon comparé à lui-même doit renvoyer 0, "
        + "pas planter ni renvoyer une valeur absurde"
    );

    console.log(
        "OK — coefficients de parenté conformes aux valeurs "
        + "de référence (0.5 / 0.25 / 0.125 / 0)"
    );

}


// =========================================
// TEST 2 : MALUS ET NIVEAUX
// =========================================

function testMalusEtNiveaux() {

    const { contexte } = chargerJeu();

    assert.equal(
        contexte.obtenirMalusConsanguinite(0),
        0,
        "aucun lien -> aucun malus"
    );

    assert.equal(
        contexte.obtenirMalusConsanguinite(0.5),
        20,
        "0.5 -> 20 points de malus"
    );

    assert.equal(
        contexte.obtenirMalusConsanguinite(0.25),
        10,
        "0.25 -> 10 points de malus"
    );

    assert.equal(
        contexte.obtenirMalusConsanguinite(0.125),
        5,
        "0.125 -> 5 points de malus"
    );

    // Le malus doit rester borné même sur un coefficient
    // anormalement élevé (lignées très repliées sur
    // elles-mêmes au fil de plusieurs générations).

    assert.ok(
        contexte.obtenirMalusConsanguinite(1) <= 35,
        "le malus doit rester plafonné même à coefficient 1"
    );

    assert.equal(
        contexte.obtenirNiveauConsanguinite(0),
        null,
        "aucun lien -> pas de badge du tout"
    );

    assert.equal(
        contexte.obtenirNiveauConsanguinite(0.5).severite,
        "notable",
        "0.5 doit être classé 'notable'"
    );

    assert.equal(
        contexte.obtenirNiveauConsanguinite(0.25).severite,
        "moderee",
        "0.25 doit être classé 'moderee'"
    );

    assert.equal(
        contexte.obtenirNiveauConsanguinite(0.125).severite,
        "legere",
        "0.125 doit être classé 'legere'"
    );

    console.log(
        "OK — malus et niveaux de sévérité cohérents"
    );

}


// =========================================
// TEST 3 (STATISTIQUE) : MALUS RÉEL DANS
// creerBebe() EN MODE LIBRE
// =========================================
//
// Fabrique un couple frère/soeur (consanguinité 0.5) et un
// couple témoin sans lien, à la MÊME génération moyenne (donc
// même chance de base avant tout malus), puis compare sur un
// grand nombre de tirages le taux d'obtention du "meilleur
// gène" de chaque parent. Le couple consanguin doit être
// mesurablement défavorisé, sans jamais empêcher la
// reproduction elle-même.

function testMalusStatistiqueEnModeLibre() {

    const { contexte } = chargerJeu();

    const GENERATION_TEST = 20;
    const NOMBRE_TIRAGES = 400;

    const pere0 =
        contexte.creerDragonAleatoire();

    const mere0 =
        contexte.creerDragonAleatoire();

    const frere =
        contexte.creerBebe(pere0, mere0);

    const soeur =
        contexte.creerBebe(pere0, mere0);

    frere.generation = GENERATION_TEST;
    soeur.generation = GENERATION_TEST;

    const coefficientFratrie =
        contexte.calculerCoefficientParente(frere, soeur);

    assert.equal(
        coefficientFratrie,
        0.5,
        "vérification préalable : frère et soeur générés "
        + "par creerBebe() doivent bien être détectés comme "
        + "consanguins à 0.5"
    );

    const etranger1 =
        contexte.creerDragonAleatoire();

    const etranger2 =
        contexte.creerDragonAleatoire();

    etranger1.generation = GENERATION_TEST;
    etranger2.generation = GENERATION_TEST;

    assert.equal(
        contexte.calculerCoefficientParente(
            etranger1,
            etranger2
        ),
        0,
        "vérification préalable : le couple témoin ne doit "
        + "avoir aucun lien détecté"
    );

    const statistiques = [
        "attaque", "defense", "endurance", "taille",
        "intelligence", "magie", "vitesse"
    ];

    function tauxMeilleurGene(pereDuTest, mereDuTest) {

        let tentatives = 0;
        let succes = 0;

        for (let i = 0; i < NOMBRE_TIRAGES; i++) {

            const bebe =
                contexte.creerBebe(
                    pereDuTest,
                    mereDuTest
                );

            statistiques.forEach(function (stat) {

                const meilleurPere =
                    Math.max(...pereDuTest.genes[stat]);

                const meilleurMere =
                    Math.max(...mereDuTest.genes[stat]);

                tentatives += 2;

                if (bebe.genes[stat][0] === meilleurPere) {
                    succes++;
                }

                if (bebe.genes[stat][1] === meilleurMere) {
                    succes++;
                }

            });

        }

        return succes / tentatives;

    }

    const tauxConsanguin =
        tauxMeilleurGene(frere, soeur);

    const tauxTemoin =
        tauxMeilleurGene(etranger1, etranger2);

    console.log(
        "   (taux 'meilleur gène' — consanguin : "
        + (tauxConsanguin * 100).toFixed(1)
        + "% / témoin : "
        + (tauxTemoin * 100).toFixed(1) + "%)"
    );

    assert.ok(
        tauxTemoin - tauxConsanguin > 0.03,
        "le couple consanguin doit avoir un taux "
        + "d'obtention du meilleur gène mesurablement plus "
        + "faible que le couple témoin, à génération égale "
        + "(écart observé : "
        + ((tauxTemoin - tauxConsanguin) * 100).toFixed(1)
        + " points, attendu > 3 points)"
    );

    // Et surtout : la reproduction n'est JAMAIS empêchée,
    // même pour le couple le plus consanguin possible.

    assert.ok(
        contexte.creerBebe(frere, soeur) !== null,
        "creerBebe() doit toujours produire un bébé, même "
        + "pour un couple frère/soeur"
    );

    console.log(
        "OK — malus statistique réellement appliqué en mode "
        + "libre, reproduction jamais bloquée"
    );

}


// =========================================
// TEST 4 : LE MODE CIBLÉ RESTE GARANTI
// =========================================

function testModeCibleToujoursGaranti() {

    const { contexte } = chargerJeu();

    const pere0 =
        contexte.creerDragonAleatoire();

    const mere0 =
        contexte.creerDragonAleatoire();

    const frere =
        contexte.creerBebe(pere0, mere0);

    const soeur =
        contexte.creerBebe(pere0, mere0);

    frere.generation = 0;
    soeur.generation = 0;

    // Génération 0 des deux côtés + frère/soeur : c'est le
    // pire cas possible pour le mode libre (malus maximal
    // sur une chance de base déjà nulle). Le mode CIBLÉ doit
    // pourtant rester garanti à 100%, à chaque tirage.

    for (let i = 0; i < 30; i++) {

        const bebe =
            contexte.creerBebe(
                frere,
                soeur,
                "attaque"
            );

        const meilleurPere =
            Math.max(...frere.genes.attaque);

        const meilleurMere =
            Math.max(...soeur.genes.attaque);

        assert.equal(
            bebe.genes.attaque[0],
            meilleurPere,
            "la statistique ciblée doit TOUJOURS hériter du "
            + "meilleur gène du père, même pour un couple "
            + "très consanguin"
        );

        assert.equal(
            bebe.genes.attaque[1],
            meilleurMere,
            "la statistique ciblée doit TOUJOURS hériter du "
            + "meilleur gène de la mère, même pour un couple "
            + "très consanguin"
        );

    }

    console.log(
        "OK — le mode ciblé reste garanti à 100%, même pour "
        + "le couple le plus consanguin possible"
    );

}


// =========================================
// EXÉCUTION
// =========================================

const tests = [
    testCoefficientsDeReference,
    testMalusEtNiveaux,
    testMalusStatistiqueEnModeLibre,
    testModeCibleToujoursGaranti
];

let echecs = 0;

for (const test of tests) {

    try {

        test();

    }

    catch (erreur) {

        echecs++;

        console.error(
            `ÉCHEC — ${test.name}`
        );

        console.error(erreur);

    }

}

if (echecs > 0) {

    console.error(
        `\n${echecs} test(s) en échec.`
    );

    process.exit(1);

}

else {

    console.log(
        "\nTous les tests de consanguinité sont passés."
    );

    process.exit(0);

}
