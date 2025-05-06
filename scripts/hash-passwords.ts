import { hashPassword } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

/**
 * Script pour mettre à jour les mots de passe existants en ajoutant un hachage
 */
async function hashExistingPasswords() {
  try {
    console.log("🔒 Début du hachage des mots de passe existants...");

    // Récupérer tous les comptes utilisateurs
    const comptes = await prisma.compte.findMany({
      select: {
        id: true,
        identifiant: true,
        motDePasse: true,
      },
    });

    console.log(`Traitement de ${comptes.length} comptes...`);

    // Pour chaque compte, hacher le mot de passe et mettre à jour
    for (const compte of comptes) {
      // On vérifie si le mot de passe est déjà haché (il contiendrait ":")
      if (!compte.motDePasse.includes(":")) {
        const hashedPassword = hashPassword(compte.motDePasse);

        await prisma.compte.update({
          where: { id: compte.id },
          data: { motDePasse: hashedPassword },
        });

        console.log(
          `✅ Mot de passe haché pour l'utilisateur: ${compte.identifiant}`
        );
      } else {
        console.log(
          `⏭️ Mot de passe déjà haché pour l'utilisateur: ${compte.identifiant}`
        );
      }
    }

    console.log("🎉 Hachage des mots de passe terminé avec succès!");
  } catch (error) {
    console.error("❌ Erreur lors du hachage des mots de passe:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script
hashExistingPasswords();
