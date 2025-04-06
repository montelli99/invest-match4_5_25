/**
 * Types and utilities for handling verification in the app
 */

/**
 * Verification levels for user profiles
 * - basic: Email and phone verified
 * - advanced: Identity and credentials verified
 * - expert: Full professional verification
 */
export type VerificationLevel = "basic" | "advanced" | "expert";

/**
 * Current verification state of a profile
 */
export interface VerificationState {
  /** The current verification level of the profile */
  level: VerificationLevel | null;
  /** ISO timestamp of last verification */
  lastVerified: string | null;
  /** User ID of the verifier */
  verifiedBy: string | null;
  /** Additional notes about verification */
  verificationNotes: string | null;
}

/**
 * Get a human-readable description of a verification level
 */
export function getVerificationDescription(level: VerificationLevel): string {
  switch (level) {
    case "basic":
      return "Email and phone verified";
    case "advanced":
      return "Identity and credentials verified";
    case "expert":
      return "Full professional verification";
    default:
      return "Unknown verification level";
  }
}
