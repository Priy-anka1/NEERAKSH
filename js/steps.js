import { requireAuth } from "./guards.js";
import { db, auth } from "./firebase.js";
import { showModal } from "./ui.js";
import {
  doc,
  updateDoc,
  increment,
  arrayUnion,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const pointsMap = { 1: 50, 2: 30, 3: 20, 4: 50 };

// Complete step
export async function completeStep(stepNumber) {
  const user = auth.currentUser;
  if (!user) return;

  const pointsMap = { 1: 50, 2: 30, 3: 20, 4: 50 };

  try {
    await updateDoc(doc(db, "users", user.uid), {
      completedSteps: arrayUnion(stepNumber),
      points: increment(pointsMap[stepNumber] || 0)
    });

    console.log(`Step ${stepNumber} completed`);
  } catch (err) {
    console.error(err);
  }
}

// 🔥 SYNC UI FROM FIRESTORE (FINAL FIX)
export function syncStepsFromDB() {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  onSnapshot(userRef, (docSnap) => {
    if (!docSnap.exists()) return;

    const steps = docSnap.data().completedSteps || [];

    // 🔥 Update progress bar width
    let maxStep = 0;
    if (steps.includes(1)) maxStep = 1;
    if (steps.includes(2)) maxStep = 2;
    if (steps.includes(3)) maxStep = 3;
    if (steps.includes(4)) maxStep = 4;

    const percentage = maxStep * 25; // 25% per step
    const pBar = document.getElementById("progress-bar");
    if (pBar) {
      pBar.style.width = percentage + "%";
    }

    steps.forEach(step => {
      markStepCompleted(step);
      unlockNextStep(step);
    });
  });
}

// UI update
function markStepCompleted(stepNumber) {
  const step = document.querySelector(`.flow-step[data-step="${stepNumber}"]`);
  if (step) {
    step.classList.remove("locked");
    step.classList.add("completed");
    step.querySelector(".lock-icon").textContent = "✅";
  }
}

function unlockNextStep(stepNumber) {
  const next = document.querySelector(`.flow-step[data-step="${stepNumber + 1}"]`);
  if (next) {
    next.classList.remove("locked");
    next.querySelector(".lock-icon").textContent = "🔓";
  }
}

// Click handler
export function handleStepClick(stepNumber) {
  const step = document.querySelector(`.flow-step[data-step="${stepNumber}"]`);

  if (step.classList.contains("locked")) {
    alert("Complete previous step first!");
    return;
  }

  if (stepNumber > 1 && !requireAuth()) return;

  if (stepNumber === 1) showModal("loginModal");
  if (stepNumber === 2) showModal("uploadModal");
  if (stepNumber === 3) showModal("detailsModal");
  if (stepNumber === 4) {
  document.getElementById("confirmTitle").innerText = localStorage.getItem("title") || "";
  document.getElementById("confirmDescription").innerText = localStorage.getItem("description") || "";
  showModal("confirmModal"); }
  }