-- CreateTable
CREATE TABLE "fiches_de_poste" (
    "id" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "poste" TEXT NOT NULL,
    "entreprise" TEXT NOT NULL,
    "type_contrat" TEXT NOT NULL,
    "duree_contrat" TEXT,
    "certifications" TEXT[],
    "habilitations" TEXT[],
    "competences_requises" TEXT[],
    "description" TEXT NOT NULL,
    "missions" TEXT[],
    "experience" TEXT,
    "formation" TEXT,
    "remuneration" TEXT,
    "avantages" TEXT,
    "horaires" TEXT,
    "lieu_travail" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "est_active" BOOLEAN NOT NULL DEFAULT true,
    "collaborateur_id" TEXT,

    CONSTRAINT "fiches_de_poste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fiches_de_poste_collaborateur_id_key" ON "fiches_de_poste"("collaborateur_id");

-- AddForeignKey
ALTER TABLE "fiches_de_poste" ADD CONSTRAINT "fiches_de_poste_collaborateur_id_fkey" FOREIGN KEY ("collaborateur_id") REFERENCES "collaborateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
