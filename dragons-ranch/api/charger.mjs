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


        const playerId =
            corps.playerId;


        if (
            typeof playerId !== "string"
            || playerId.trim() === ""
        ) {

            throw new Error(
                "Identifiant du joueur invalide."
            );

        }


        const client =
            createClient({

                url:
                    process.env.TURSO_DATABASE_URL,

                authToken:
                    process.env.TURSO_AUTH_TOKEN

            });


        const resultat =
            await client.execute({

                sql: `
                    SELECT
                        donnees,
                        date_modification
                    FROM sauvegardes
                    WHERE player_id = ?
                `,

                args: [
                    playerId
                ]

            });


        if (resultat.rows.length === 0) {

            return new Response(

                JSON.stringify({
                    succes: false,
                    trouvee: false,
                    erreur:
                        "Aucune sauvegarde trouvée."
                }),

                {
                    status: 404,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }

            );

        }


        const ligne =
            resultat.rows[0];


        const donnees =
            JSON.parse(
                ligne.donnees
            );


        return new Response(

            JSON.stringify({
                succes: true,
                trouvee: true,
                donnees: donnees,
                dateModification:
                    ligne.date_modification
            }),

            {
                status: 200,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }

        );

    }

    catch (erreur) {

        console.error(
            "ERREUR CHARGEMENT DISTANT :",
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
