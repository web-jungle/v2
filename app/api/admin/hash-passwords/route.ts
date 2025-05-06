import { hashPassword } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

// Clé secrète pour autoriser l'accès (à remplacer en production)
const SECRET_KEY = "hash_password_secret_key";

// API accessible via une simple visite d'URL (GET)
export async function GET(request: Request) {
  try {
    // Récupérer la clé de sécurité depuis l'URL
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    // Vérifier la clé de sécurité
    if (key !== SECRET_KEY) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Accès refusé</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #dc2626; }
              .error { background: #fee2e2; padding: 15px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>❌ Accès refusé</h1>
            <div class="error">
              <p>Vous devez fournir une clé de sécurité valide pour effectuer cette opération.</p>
              <p>Exemple: /api/admin/hash-passwords?key=hash_password_secret_key</p>
            </div>
          </body>
        </html>`,
        {
          status: 403,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        }
      );
    }

    // Récupérer tous les comptes utilisateurs
    const comptes = await prisma.compte.findMany({
      select: {
        id: true,
        identifiant: true,
        motDePasse: true,
      },
    });

    const results = {
      total: comptes.length,
      hashed: 0,
      skipped: 0,
      details: [] as string[],
    };

    // Pour chaque compte, hacher le mot de passe et mettre à jour
    for (const compte of comptes) {
      // On vérifie si le mot de passe est déjà haché (il contiendrait ":")
      if (!compte.motDePasse.includes(":")) {
        const hashedPassword = hashPassword(compte.motDePasse);

        await prisma.compte.update({
          where: { id: compte.id },
          data: { motDePasse: hashedPassword },
        });

        results.hashed++;
        results.details.push(
          `✅ Mot de passe haché pour l'utilisateur: ${compte.identifiant}`
        );
      } else {
        results.skipped++;
        results.details.push(
          `⏭️ Mot de passe déjà haché pour l'utilisateur: ${compte.identifiant}`
        );
      }
    }

    // Formatage HTML pour une meilleure présentation dans le navigateur
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hachage des mots de passe</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #2563eb; }
            .success { color: #059669; }
            .details { background: #f1f5f9; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto; }
            .success-item { color: #059669; }
            .skip-item { color: #9333ea; }
          </style>
        </head>
        <body>
          <h1>Hachage des mots de passe</h1>
          <p class="success">✅ <strong>Opération terminée avec succès!</strong></p>
          <p><strong>Résumé:</strong> Total: ${results.total}, Hachés: ${
      results.hashed
    }, Ignorés: ${results.skipped}</p>
          
          <h2>Détails:</h2>
          <div class="details">
            <ul>
              ${results.details
                .map((detail) => {
                  const isSuccess = detail.includes("✅");
                  return `<li class="${
                    isSuccess ? "success-item" : "skip-item"
                  }">${detail}</li>`;
                })
                .join("")}
            </ul>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(htmlResponse, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors du hachage des mots de passe:", error);

    // Formatage HTML pour l'erreur
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Erreur - Hachage des mots de passe</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #dc2626; }
            .error { background: #fee2e2; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>❌ Erreur lors du hachage des mots de passe</h1>
          <div class="error">
            <p>${String(error)}</p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(errorHtml, {
      status: 500,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }
}
