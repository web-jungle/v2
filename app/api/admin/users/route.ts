import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all users
export async function GET() {
  try {
    const users = await prisma.utilisateur.findMany({
      orderBy: {
        nom: "asc", // Ou un autre champ de tri si vous préférez
      },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      {
        message: "Erreur lors de la récupération des utilisateurs",
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      identifiant,
      nom,
      role,
      collaborateur_id,
      collaborateurs_geres,
      mot_de_passe,
    } = body;

    if (!identifiant || !mot_de_passe || !nom || !role) {
      return NextResponse.json(
        { message: "Champs manquants" },
        { status: 400 }
      );
    }

    // Idéalement, hashez le mot de passe ici avant la création
    // const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const newUser = await prisma.utilisateur.create({
      data: {
        identifiant,
        nom,
        role,
        collaborateurId: collaborateur_id,
        collaborateursGeres: collaborateurs_geres || [],
        motDePasse: mot_de_passe, // Correction ici
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    // Gérer les erreurs spécifiques (ex: identifiant déjà existant)
    if (error.code === "P2002" && error.meta?.target?.includes("identifiant")) {
      return NextResponse.json(
        { message: "Cet identifiant est déjà utilisé" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        message: "Erreur lors de la création de l'utilisateur",
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
