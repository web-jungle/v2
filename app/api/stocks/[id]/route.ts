import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/stocks/[id] - Récupérer un élément de stock par son ID
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const stockItem = await prisma.stockItem.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!stockItem) {
      return NextResponse.json(
        { error: "Élément de stock non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(stockItem);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'élément de stock:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'élément de stock" },
      { status: 500 }
    );
  }
}

// PUT /api/stocks/[id] - Mettre à jour un élément de stock
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const data = await request.json();
    const stockItem = await prisma.stockItem.update({
      where: {
        id: params.id,
      },
      data,
    });
    return NextResponse.json(stockItem);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'élément de stock:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'élément de stock" },
      { status: 500 }
    );
  }
}

// DELETE /api/stocks/[id] - Supprimer un élément de stock
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await prisma.stockItem.delete({
      where: {
        id: params.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'élément de stock:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'élément de stock" },
      { status: 500 }
    );
  }
}
