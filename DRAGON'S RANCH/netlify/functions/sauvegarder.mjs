import { createClient } from "@libsql/client/web";


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


        const donnees =
            corps.donnees;


        if (
            typeof playerId !== "string"
            || playerId.trim() === ""
        ) {

            throw new Error(
                "Identifiant du joueur invalide."
            );

        }


        if (
            typeof donnees !== "object"
            || donnees === null
            || Array.isArray(donnees)
        ) {

            throw new Error(
                "Données de sauvegarde invalides."
            );

        }


        const client =
            createClient({

                url:
                    Netlify.env.get(
                        "TURSO_DATABASE_URL"
                    ),

                authToken:
                    Netlify.env.get(
                        "TURSO_AUTH_TOKEN"
                    )

            });


        await client.execute({

            sql: `
                INSERT INTO sauvegardes (
                    player_id,
                    donnees,
                    date_modification
                )
                VALUES (?, ?, ?)

                ON CONFLICT(player_id)
                DO UPDATE SET

                    donnees =
                        excluded.donnees,

                    date_modification =
                        excluded.date_modification
            `,

            args: [

                playerId,

                JSON.stringify(
                    donnees
                ),

                new Date().toISOString()

            ]

        });


        return new Response(

            JSON.stringify({
                succes: true
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
            "ERREUR SAUVEGARDE DISTANTE :",
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