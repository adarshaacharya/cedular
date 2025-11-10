/**
 * Calendar integration constants
 */

export const CALENDAR_API_VERSION = "v3" as const;
export const CALENDAR_USER_ID = "me" as const;

// Token refresh threshold (5 minutes before expiry)
export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// Calendar event statuses
export const EVENT_STATUS = {
  CONFIRMED: "confirmed",
  TENTATIVE: "tentative",
  CANCELLED: "cancelled",
} as const;

// Calendar event visibility
export const EVENT_VISIBILITY = {
  DEFAULT: "default",
  PUBLIC: "public",
  PRIVATE: "private",
  CONFIDENTIAL: "confidential",
} as const;

// Calendar event transparency
export const EVENT_TRANSPARENCY = {
  OPAQUE: "opaque", // Blocks time on calendar
  TRANSPARENT: "transparent", // Doesn't block time
} as const;

// Default calendar ID (primary calendar)
export const PRIMARY_CALENDAR_ID = "primary";

