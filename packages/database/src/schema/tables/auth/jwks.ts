import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * JWKS (JSON Web Key Set) table for Better Auth JWT plugin
 *
 * Stores public/private key pairs for JWT signing and verification.
 * Keys are automatically rotated based on the JWT plugin configuration.
 *
 * @see https://www.better-auth.com/docs/plugins/jwt
 */
export const jwks = pgTable("jwks", {
  // Unique identifier for the key
  id: text("id").primaryKey(),
  // Public key (used for verification)
  publicKey: text("public_key").notNull(),
  // Private key (encrypted, used for signing)
  privateKey: text("private_key").notNull(),
  // When the key was created
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // When the key expires (for rotation)
  expiresAt: timestamp("expires_at"),
});
