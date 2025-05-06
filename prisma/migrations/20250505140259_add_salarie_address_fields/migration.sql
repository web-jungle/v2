-- AlterTable
ALTER TABLE "salaries" ADD COLUMN     "adresse" TEXT,
ADD COLUMN     "code_postal" TEXT,
ADD COLUMN     "date_naissance" TIMESTAMP(3),
ADD COLUMN     "numero_secu" TEXT,
ADD COLUMN     "ville" TEXT;
