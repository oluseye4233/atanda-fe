/**
 * Snapshot returned by GET /v1/feature-flags.
 * Keys are flag names; values are on/off states.
 */
export type FeatureFlags = Record<string, boolean>;
