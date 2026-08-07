export const CURRENT_USER_ACCESS_REFRESH_EVENT = "voyzu:current-user-access-refresh";

export function refreshCurrentUserAccess(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CURRENT_USER_ACCESS_REFRESH_EVENT));
}
