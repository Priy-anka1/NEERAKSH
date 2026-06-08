import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import { auth } from "./firebase.js";
import { hideModal } from "./ui.js";
import { completeStep } from "./steps.js";
import { setUser, clearUser } from "./state.js";
import { db } from "./firebase.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

let confirmationResult;

// Send OTP
export async function sendOTP(phone) {
  try {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      window.recaptchaVerifier
    );

    document.getElementById("otpForm").style.display = "block";
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// Verify OTP
export async function verifyOTP(code) {
  try {
    const result = await confirmationResult.confirm(code);

    setUser(result.user);

    // ✅ CHECK FOR EXISTING USER BEFORE SETTING DEFAULT (IMPORTANT FIX)
    const userRef = doc(db, "users", result.user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        points: 0,
        completedSteps: []
      });
      // ✅ Complete step 1 (only for fresh users)
      await completeStep(1);
    }

    hideModal("loginModal");

    alert("Login/Signup successful ✅");
  } catch (err) {
    console.error(err);
    alert("Invalid OTP ❌");
  }
}

// Logout
export async function logoutUser() {
  await signOut(auth);
  clearUser();
  location.reload();
}

// Sync auth
export function listenAuthChanges() {
  onAuthStateChanged(auth, (user) => {
    if (user) setUser(user);
    else clearUser();
  });
}