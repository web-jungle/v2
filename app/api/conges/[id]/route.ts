import { verifyToken } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Middleware d'authentification
async function authenticate(request: Request) {
  // Extraire le token du header Authorization
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7); // Enlever "Bearer " du début

  // Vérifier le token
  const payload = await verifyToken(token);
  return payload;
}

// GET /api/conges/[id] - Récupérer une demande de congés spécifique
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    // Vérification d'authentification
    const authPayload = await authenticate(req);

    if (!authPayload) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = params.id;
    console.log("GET /api/conges/[id] - Récupération de la demande:", id);

    // Récupérer la demande de congés
    const demandeConge = await prisma.demandeConge.findUnique({
      where: { id },
      include: {
        utilisateur: {
          select: {
            role: true,
          },
        },
        collaborateur: true,
      },
    });

    if (!demandeConge) {
      return NextResponse.json(
        { error: "Demande de congés non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(demandeConge);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la demande de congés:",
      error
    );
    return NextResponse.json(
      { error: "Impossible de récupérer la demande de congés" },
      { status: 500 }
    );
  }
}

// PATCH /api/conges/[id] - Mettre à jour une demande de congés (généralement son statut)
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    // Vérification d'authentification
    const authPayload = await authenticate(req);

    if (!authPayload) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = params.id;
    const requestData = await req.json();
    console.log("PATCH /api/conges/[id] - Données reçues:", requestData);

    // Vérifier si la demande existe
    const existingDemande = await prisma.demandeConge.findUnique({
      where: { id },
    });

    if (!existingDemande) {
      return NextResponse.json(
        { error: "Demande de congés non trouvée" },
        { status: 404 }
      );
    }

    // Extraire les données à mettre à jour
    const { statut, commentaireAdmin, dateDebut, dateFin, typeConge, motif } =
      requestData;

    // Préparer les données pour la mise à jour
    const updateData: any = {
      dateModification: new Date(),
    };

    // Ajouter les champs à mettre à jour
    if (statut !== undefined) updateData.statut = statut;
    if (commentaireAdmin !== undefined)
      updateData.commentaireAdmin = commentaireAdmin;
    if (dateDebut !== undefined) updateData.dateDebut = new Date(dateDebut);
    if (dateFin !== undefined) updateData.dateFin = new Date(dateFin);
    if (typeConge !== undefined) updateData.typeConge = typeConge;
    if (motif !== undefined) updateData.motif = motif;

    // Mettre à jour la demande
    const updatedDemande = await prisma.demandeConge.update({
      where: { id },
      data: updateData,
      include: {
        utilisateur: {
          select: {
            role: true,
          },
        },
        collaborateur: true,
      },
    });

    // Si le statut a changé, marquer la notification comme non lue pour l'utilisateur
    if (statut !== undefined && statut !== existingDemande.statut) {
      await prisma.notification.create({
        data: {
          utilisateurId: existingDemande.utilisateurId,
          message: `Votre demande de congés a été ${statut.toLowerCase()}`,
          lien: `/rh/conges?id=${id}`,
          dateCreation: new Date(),
          lue: false,
          type: "conge",
          demandeId: id,
        },
      });
    }

    console.log("Demande de congés mise à jour avec succès:", id);
    return NextResponse.json(updatedDemande);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la demande de congés:",
      error
    );
    return NextResponse.json(
      { error: "Impossible de mettre à jour la demande de congés" },
      { status: 500 }
    );
  }
}

// DELETE /api/conges/[id] - Supprimer une demande de congés
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    // Vérification d'authentification
    const authPayload = await authenticate(req);

    if (!authPayload) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = params.id;
    console.log("DELETE /api/conges/[id] - Suppression de la demande:", id);

    // Vérifier si la demande existe
    const existingDemande = await prisma.demandeConge.findUnique({
      where: { id },
    });

    if (!existingDemande) {
      return NextResponse.json(
        { error: "Demande de congés non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer d'abord les notifications associées
    await prisma.notification.deleteMany({
      where: { demandeId: id },
    });

    // Supprimer la demande de congés
    await prisma.demandeConge.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Demande de congés supprimée avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de la demande de congés:",
      error
    );
    return NextResponse.json(
      { error: "Impossible de supprimer la demande de congés" },
      { status: 500 }
    );
  }
}
