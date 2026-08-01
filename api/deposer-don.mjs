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


        const donneurId =
            corps.donneurId;

        const dragon =
            corps.dragon;

        const destinataireId =
            typeof corps.destinataireId === "string"
            && corps.destinataireId.trim() !== ""
                ? corps.destinataireId.trim()
                : null;


        if (
            typeof donneurId !== "string"
            || donneurId.trim() === ""
        ) {

            throw new Error(
                "Identifiant du donneur invalide."
            );

        }


        if (
            typeof dragon !== "object"
            || dragon === null
            || Array.isArray(dragon)
            || typeof dragon.id !== "string"
        ) {

            throw new Error(
                "Dragon invalide."
            );

        }


        // Un joueur ne peut pas se cibler lui-même.

        if (destinataireId === donneurId) {

            throw new Error(
                "Tu ne peux pas te faire un don à toi-même."
            );

        }


        const client =
            createClient({

                url:
                    process.env.TURSO_DATABASE_URL,

                authToken:
                    process.env.TURSO_AUTH_TOKEN

            });


        const idDon =
            crypto.randomUUID();


        await client.execute({

            sql: `
                INSERT INTO dons_dragons (
                    id,
                    donneur_id,
                    destinataire_id,
                    dragon_donnees,
                    date_don
                )
                VALUES (?, ?, ?, ?, ?)
            `,

            args: [

                idDon,

                donneurId,

                destinataireId,

                JSON.stringify(dragon),

                new Date().toISOString()

            ]

        });


        return new Response(

            JSON.stringify({
                succes: true,
                idDon: idDon
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
            "ERREUR DÉPÔT DE DON :",
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
