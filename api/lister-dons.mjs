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


        const joueurId =
            corps.joueurId;


        if (
            typeof joueurId !== "string"
            || joueurId.trim() === ""
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


        // Dons disponibles pour ce joueur : la bourse
        // publique (destinataire_id NULL), plus ceux qui
        // lui sont spécifiquement destinés — mais jamais
        // ses propres dons (il ne peut pas se réclamer
        // lui-même).

        const disponibles =
            await client.execute({

                sql: `
                    SELECT
                        id,
                        donneur_id,
                        destinataire_id,
                        dragon_donnees,
                        date_don
                    FROM dons_dragons
                    WHERE donneur_id != ?
                      AND (
                          destinataire_id IS NULL
                          OR destinataire_id = ?
                      )
                    ORDER BY date_don DESC
                `,

                args: [
                    joueurId,
                    joueurId
                ]

            });


        // Les dons que CE joueur a lui-même déposés et
        // qui attendent encore d'être réclamés (pour
        // pouvoir les annuler).

        const mesDons =
            await client.execute({

                sql: `
                    SELECT
                        id,
                        destinataire_id,
                        dragon_donnees,
                        date_don
                    FROM dons_dragons
                    WHERE donneur_id = ?
                    ORDER BY date_don DESC
                `,

                args: [
                    joueurId
                ]

            });


        function formaterLignes(lignes) {

            return lignes.map(
                function (ligne) {

                    return {

                        id: ligne.id,

                        donneurId:
                            ligne.donneur_id,

                        destinataireId:
                            ligne.destinataire_id,

                        dragon:
                            JSON.parse(
                                ligne.dragon_donnees
                            ),

                        dateDon:
                            ligne.date_don

                    };

                }
            );

        }


        return new Response(

            JSON.stringify({

                succes: true,

                donsDisponibles:
                    formaterLignes(
                        disponibles.rows
                    ),

                mesDons:
                    formaterLignes(
                        mesDons.rows
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
            "ERREUR LISTE DES DONS :",
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
