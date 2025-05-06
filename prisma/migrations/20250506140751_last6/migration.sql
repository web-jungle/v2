/*
  Warnings:

  - You are about to drop the column `lieu_travail` on the `fiches_de_poste` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "fiches_de_poste" DROP COLUMN "lieu_travail",
ADD COLUMN     "adresse" TEXT,
ADD COLUMN     "code_postal" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "telephone" TEXT,
ADD COLUMN     "ville" TEXT;
