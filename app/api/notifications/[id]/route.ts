import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/notifications/[id] - Récupérer une notification par son ID
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const notification = await prisma.notification.findUnique({
      where: {
        id: params.id,
      },
      include: {
        utilisateur: true,
        demandeConge: true,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification non trouvée" },
        { status: 404 }
      );
    }

    // Convertir les dates en objets Date pour la compatibilité avec le code existant
    const formattedNotification = {
      ...notification,
      dateCreation: new Date(notification.dateCreation),
    };

    return NextResponse.json(formattedNotification);
  } catch (error) {
    console.error("Erreur lors de la récupération de la notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la notification" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/[id] - Mettre à jour une notification
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const data = await request.json();

    const notification = await prisma.notification.update({
      where: {
        id: params.id,
      },
      data,
      include: {
        utilisateur: true,
        demandeConge: true,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la notification" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Supprimer une notification
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await prisma.notification.delete({
      where: {
        id: params.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la notification" },
      { status: 500 }
    );
  }
}
