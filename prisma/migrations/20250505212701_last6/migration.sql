/*
  Warnings:

  - You are about to drop the `utilisateurs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ManagerCollaborateurs" DROP CONSTRAINT "_ManagerCollaborateurs_B_fkey";

-- DropForeignKey
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "demandes_conges" DROP CONSTRAINT "demandes_conges_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "utilisateurs" DROP CONSTRAINT "utilisateurs_collaborateur_id_fkey";

-- AlterTable
ALTER TABLE "collaborateurs" ADD COLUMN     "a_compte" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "utilisateurs";

-- CreateTable
CREATE TABLE "comptes" (
    "id" TEXT NOT NULL,
    "identifiant" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "collaborateur_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comptes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comptes_identifiant_key" ON "comptes"("identifiant");

-- CreateIndex
CREATE UNIQUE INDEX "comptes_collaborateur_id_key" ON "comptes"("collaborateur_id");

-- AddForeignKey
ALTER TABLE "comptes" ADD CONSTRAINT "comptes_collaborateur_id_fkey" FOREIGN KEY ("collaborateur_id") REFERENCES "collaborateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "comptes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_conges" ADD CONSTRAINT "demandes_conges_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "comptes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "comptes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManagerCollaborateurs" ADD CONSTRAINT "_ManagerCollaborateurs_B_fkey" FOREIGN KEY ("B") REFERENCES "comptes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
