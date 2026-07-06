import { createClient } from "@libsql/client/web";


export const config = {
    runtime: "edge"
};


export default async function () {

    try {

        const client =
            createClient({

                url:
                    process.env.TURSO_DATABASE_URL,

                authToken:
                    process.env.TURSO_AUTH_TOKEN

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
                    donnees = excluded.donnees,
                    date_modification =
                        excluded.date_modification
            `,

            args: [
                "test-connexion",
                JSON.stringify({
                    message:
                        "Connexion Turso réussie"
                }),
                new Date().toISOString()
            ]

        });


        return new Response(

            JSON.stringify({

                succes: true,

                message:
                    "Connexion à Turso réussie."

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
            "ERREUR TURSO :",
            erreur
        );


        return new Response(

            JSON.stringify({

                succes: false,

                erreur:
                    erreur.message

            }),

            {
                status: 500,

                headers: {
                    "Content-Type":
                        "application/json"
                }
            }

        );

    }

}
