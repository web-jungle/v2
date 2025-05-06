-- DropForeignKey
ALTER TABLE "demandes_conges" DROP CONSTRAINT "demandes_conges_collaborateur_id_fkey";

-- DropForeignKey
ALTER TABLE "evenements" DROP CONSTRAINT "evenements_collaborateur_id_fkey";

-- DropForeignKey
ALTER TABLE "salaries" DROP CONSTRAINT "salaries_collaborateur_id_fkey";

-- AddForeignKey
ALTER TABLE "evenements" ADD CONSTRAINT "evenements_collaborateur_id_fkey" FOREIGN KEY ("collaborateur_id") REFERENCES "collaborateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_collaborateur_id_fkey" FOREIGN KEY ("collaborateur_id") REFERENCES "collaborateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_conges" ADD CONSTRAINT "demandes_conges_collaborateur_id_fkey" FOREIGN KEY ("collaborateur_id") REFERENCES "collaborateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
