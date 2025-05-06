-- CreateEnum
CREATE TYPE "RoleAdmin" AS ENUM ('super_admin', 'admin', 'moderateur');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "role" "RoleAdmin" NOT NULL,
    "departement" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dernier_acces" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");
