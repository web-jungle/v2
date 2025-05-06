-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'manager', 'collaborateur');

-- CreateTable
CREATE TABLE "collaborateurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "couleur" TEXT NOT NULL,
    "entreprise" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collaborateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "identifiant" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "collaborateur_id" TEXT,
    "collaborateurs_geres" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "collaborateur_id" TEXT NOT NULL,
    "type_evenement" TEXT NOT NULL,
    "lieu_chantier" TEXT,
    "zone_trajet" TEXT,
    "panier_repas" BOOLEAN NOT NULL DEFAULT false,
    "ticket_restaurant" BOOLEAN NOT NULL DEFAULT false,
    "heures_supplementaires" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grand_deplacement" BOOLEAN NOT NULL DEFAULT false,
    "prgd" BOOLEAN NOT NULL DEFAULT false,
    "nombre_prgd" INTEGER NOT NULL DEFAULT 0,
    "type_absence" TEXT,
    "verrouille" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "adresse_complete" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evenements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salaries" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "date_entree" TIMESTAMP(3) NOT NULL,
    "type_contrat" TEXT NOT NULL,
    "duree_contrat" TEXT,
    "certifications" TEXT[],
    "habilitations" TEXT[],
    "entreprise" TEXT NOT NULL,
    "poste" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "collaborateur_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicules" (
    "id" TEXT NOT NULL,
    "societe" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "etat" TEXT NOT NULL,
    "proprietaire" TEXT NOT NULL,
    "date_mise_en_circulation" TIMESTAMP(3),
    "kilometrage" INTEGER,
    "km_prochaine_revision" INTEGER,
    "date_limite_controle_technique" TIMESTAMP(3),
    "date_limite_controle_pollution" TIMESTAMP(3),
    "type_vehicule" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "code_postal" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "categories" TEXT[],
    "status" TEXT NOT NULL,
    "commentaires" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL,
    "date_derniere_modification" TIMESTAMP(3) NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "collaborateurs_ids" TEXT[],
    "montant_devis" DOUBLE PRECISION,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archive_date" TIMESTAMP(3),

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes_conges" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "collaborateur_id" TEXT NOT NULL,
    "collaborateur_nom" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "type_conge" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "commentaire_admin" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL,
    "date_modification" TIMESTAMP(3) NOT NULL,
    "notification_lue" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "demandes_conges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lien" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL,
    "lue" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "demande_id" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats_maintenance" (
    "id" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_echeance" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contact_client" TEXT NOT NULL,
    "email_contact" TEXT NOT NULL,
    "telephone_contact" TEXT NOT NULL,
    "notes" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL,
    "date_derniere_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrats_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_items" (
    "id" TEXT NOT NULL,
    "cable_type" TEXT NOT NULL,
    "type_m" TEXT NOT NULL,
    "type_g" TEXT NOT NULL,
    "enroulement" TEXT NOT NULL,
    "longueur" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CollaborateurContact" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollaborateurContact_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_identifiant_key" ON "utilisateurs"("identifiant");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_collaborateur_id_key" ON "utilisateurs"("collaborateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "salaries_collaborateur_id_key" ON "salaries"("collaborateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicules_immatriculation_key" ON "vehicules"("immatriculation");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_maintenance_reference_key" ON "contrats_maintenance"("reference");

-- CreateIndex
CREATE INDEX "_CollaborateurContact_B_index" ON "_CollaborateurContact"("B");

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_collaborateur_id_fkey" FOREIGN KEY ("collaborateur_id") REFERENCES "collaborateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenements" ADD CONSTRAINT "evenements_collaborateur_id_fkey" FOREIGN KEY ("collaborateur_id") REFERENCES "collaborateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_collaborateur_id_fkey" FOREIGN KEY ("collaborateur_id") REFERENCES "collaborateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_conges" ADD CONSTRAINT "demandes_conges_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_conges" ADD CONSTRAINT "demandes_conges_collaborateur_id_fkey" FOREIGN KEY ("collaborateur_id") REFERENCES "collaborateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_demande_id_fkey" FOREIGN KEY ("demande_id") REFERENCES "demandes_conges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollaborateurContact" ADD CONSTRAINT "_CollaborateurContact_A_fkey" FOREIGN KEY ("A") REFERENCES "collaborateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollaborateurContact" ADD CONSTRAINT "_CollaborateurContact_B_fkey" FOREIGN KEY ("B") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
