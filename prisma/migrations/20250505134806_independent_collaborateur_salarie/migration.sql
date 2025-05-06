-- DropForeignKey
ALTER TABLE "salaries" DROP CONSTRAINT "salaries_collaborateur_id_fkey";

-- AlterTable
ALTER TABLE "salaries" ALTER COLUMN "collaborateur_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_collaborateur_id_fkey" FOREIGN KEY ("collaborateur_id") REFERENCES "collaborateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
