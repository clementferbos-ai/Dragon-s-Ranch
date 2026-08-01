import { createClient } from "@libsql/client/web";


export const config = {
    runtime: "edge"
};


export default async function (requete) {

    if (requete.method !== "POST") {

        return new Response(

            JSON.stringify({
                succes: false,
                erreur: "Méthode non autorisée."
            }),

            {
                status: 405,
                headers: {
                    "Content-Type": "application/json"
                }
            }

        );

    }


    try {

        const corps =
            await requete.json();


        const idDon =
            corps.idDon;

        const donneurId =
            corps.donneurId;


        if (
            typeof idDon !== "string"
            || idDon.trim() === ""
            || typeof donneurId !== "string"
            || donneurId.trim() === ""
        ) {

            throw new Error(
                "Requête d'annulation invalide."
            );

        }


        const client =
            createClient({

                url:
                    process.env.TURSO_DATABASE_URL,

                authToken:
                    process.env.TURSO_AUTH_TOKEN

            });


        // Seul le donneur d'origine peut annuler son
        // propre don, et seulement s'il n'a pas déjà été
        // réclamé (sinon la ligne n'existe plus).

        const resultat =
            await client.execute({

                sql: `
                    DELETE FROM dons_dragons
                    WHERE id = ?
                      AND donneur_id = ?
                    RETURNING dragon_donnees
                `,

                args: [
                    idDon,
                    donneurId
                ]

            });


        if (resultat.rows.length === 0) {

            return new Response(

                JSON.stringify({
                    succes: false,
                    erreur:
                        "Ce don n'existe plus ou ne "
                        + "t'appartient pas (peut-être "
                        + "déjà réclamé)."
                }),

                {
                    status: 409,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }

            );

        }


        const ligne =
            resultat.rows[0];


        return new Response(

            JSON.stringify({

                succes: true,

                dragon:
                    JSON.parse(
                        ligne.dragon_donnees
                    )

            }),

            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }

        );

    }

    catch (erreur) {

        console.error(
            "ERREUR ANNULATION DE DON :",
            erreur
        );


        return new Response(

            JSON.stringify({
                succes: false,
                erreur: erreur.message
            }),

            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }

        );

    }

}
