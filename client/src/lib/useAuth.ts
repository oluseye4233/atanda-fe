/**
 * Re-exports useAuth and AuthUser from the canonical AuthContext.
 * Kept for backward compatibility — existing imports of "@/lib/useAuth" continue to work.
 */
export { useAuth, type AuthUser } from "@/contexts/AuthContext";
