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

        const joueurId =
            corps.joueurId;


        if (
            typeof idDon !== "string"
            || idDon.trim() === ""
            || typeof joueurId !== "string"
            || joueurId.trim() === ""
        ) {

            throw new Error(
                "Requête de réclamation invalide."
            );

        }


        const client =
            createClient({

                url:
                    process.env.TURSO_DATABASE_URL,

                authToken:
                    process.env.TURSO_AUTH_TOKEN

            });


        // DELETE ... RETURNING en une seule requête
        // atomique : soit ce joueur est le premier (et
        // le seul) à réclamer ce don précis, soit la
        // ligne n'existe déjà plus (déjà réclamée par
        // quelqu'un d'autre, annulée par le donneur, ou
        // réservée à un autre destinataire) et aucune
        // ligne n'est retournée. Impossible que deux
        // joueurs réclament le même don.

        const resultat =
            await client.execute({

                sql: `
                    DELETE FROM dons_dragons
                    WHERE id = ?
                      AND donneur_id != ?
                      AND (
                          destinataire_id IS NULL
                          OR destinataire_id = ?
                      )
                    RETURNING donneur_id, dragon_donnees
                `,

                args: [
                    idDon,
                    joueurId,
                    joueurId
                ]

            });


        if (resultat.rows.length === 0) {

            return new Response(

                JSON.stringify({
                    succes: false,
                    erreur:
                        "Ce don n'est plus disponible "
                        + "(déjà réclamé, annulé, ou pas "
                        + "pour toi)."
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

                donneurId:
                    ligne.donneur_id,

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
            "ERREUR RÉCLAMATION DE DON :",
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
