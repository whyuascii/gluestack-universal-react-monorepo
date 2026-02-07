/**
 * Contract Router
 *
 * Main contract definition organized by access level:
 * - public: No auth required
 * - private: Auth required
 * - admin: Auth + admin role required
 */
import { publicContract } from "./contracts/public";
import { privateContract } from "./contracts/private";
import { adminContract } from "./contracts/admin";

export const contract = {
  public: publicContract,
  private: privateContract,
  admin: adminContract,
};

export type Contract = typeof contract;
