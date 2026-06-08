import { userState } from "./state.js";

export function requireAuth() {
  if (!userState.isLoggedIn) {
    alert("⚠️ Please login first");
    return false;
  }
  return true;
}
