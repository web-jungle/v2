/*
  Warnings:

  - You are about to drop the column `collaborateurs_geres` on the `utilisateurs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "utilisateurs" DROP COLUMN "collaborateurs_geres";

-- CreateTable
CREATE TABLE "_ManagerCollaborateurs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ManagerCollaborateurs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ManagerCollaborateurs_B_index" ON "_ManagerCollaborateurs"("B");

-- AddForeignKey
ALTER TABLE "_ManagerCollaborateurs" ADD CONSTRAINT "_ManagerCollaborateurs_A_fkey" FOREIGN KEY ("A") REFERENCES "collaborateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManagerCollaborateurs" ADD CONSTRAINT "_ManagerCollaborateurs_B_fkey" FOREIGN KEY ("B") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
