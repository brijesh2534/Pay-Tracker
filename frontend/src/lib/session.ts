const USER_KEY = "pay_tracker_user";
const TOKEN_KEY = "pay_tracker_token";

/** Both cached profile and JWT must exist for authenticated API calls. */
export function hasStoredSession(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(TOKEN_KEY) && localStorage.getItem(USER_KEY));
}
