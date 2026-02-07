/**
 * Shared oRPC Implementer
 *
 * Single source of truth for the contract implementer.
 * All route files import from here to ensure type safety.
 */
import { contract } from "@app/core-contract";
import { implement } from "@orpc/server";

export const os = implement(contract);
