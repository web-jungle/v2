import * as crypto from "crypto";
import { jwtVerify, SignJWT } from "jose";

// Clé secrète pour signer les JWT - à stocker dans les variables d'environnement en production
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "votre_cle_secrete_tres_complexe_a_changer"
);
const TOKEN_EXPIRATION = "8h"; // Durée de validité du token

/**
 * Hache un mot de passe avec un sel aléatoire
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Vérifie si un mot de passe correspond à un hash
 */
export function verifyPassword(
  password: string,
  hashedPassword: string
): boolean {
  const [salt, storedHash] = hashedPassword.split(":");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return storedHash === hash;
}

/**
 * Génère un token JWT
 */
export async function generateToken(
  userId: string,
  role: string
): Promise<string> {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(JWT_SECRET);
}

/**
 * Vérifie un token JWT
 */
export async function verifyToken(
  token: string
): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { userId: payload.userId as string, role: payload.role as string };
  } catch (error) {
    return null;
  }
}
