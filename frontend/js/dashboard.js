import { db, auth } from "./firebase.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

export function loadDashboard() {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    onSnapshot(userRef, (docSnap) => {
      if (!docSnap.exists()) return;

      const data = docSnap.data();
      const points = data.points || 0;

      console.log("🔥 Points from DB:", points);

      // ✅ Update UI in both sections
      const dashboardPointsEl = document.getElementById("dashboardPoints");
      if (dashboardPointsEl) dashboardPointsEl.innerText = points;

      const topPointsEl = document.getElementById("points");
      if (topPointsEl) topPointsEl.innerText = points;

      const btn = document.getElementById("downloadCertBtn");

      if (points >= 150) {
        btn.disabled = false;
        btn.innerText = "🎉 Download Certificate";
        btn.style.background = "#16a34a";
        btn.style.cursor = "pointer";
      } else {
        btn.disabled = true;
        btn.innerText = `🔒 Need ${150 - points} more points`;
        btn.style.background = "#9ca3af";
      }
    });
  });
}