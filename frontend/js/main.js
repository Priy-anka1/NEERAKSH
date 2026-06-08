import { logoutUser, listenAuthChanges, sendOTP, verifyOTP } from "./auth.js";
import { loadDashboard } from "./dashboard.js";
import { handleStepClick, syncStepsFromDB, completeStep } from "./steps.js";
import { auth, db, storage } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { hideModal } from "./ui.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { doc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {

  // Step clicks
  document.querySelectorAll(".flow-step").forEach(step => {
    step.addEventListener("click", () => {
      const stepNumber = Number(step.dataset.step);
      handleStepClick(stepNumber);
    });
  });

  // OTP
  document.getElementById("send-otp-btn").addEventListener("click", () => {
    const phone = document.getElementById("phoneNumber").value;
    sendOTP(phone);
  });

  document.getElementById("verify-otp-btn").addEventListener("click", () => {
    const otp = document.getElementById("otp").value;
    verifyOTP(otp);
  });

  // Auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadDashboard();
      syncStepsFromDB(); // 🔥 THIS FIXES YOUR ISSUE
      document.querySelectorAll(".logout-btn, #logoutBtn").forEach(btn => btn.style.display = "inline-flex");
    } else {
      document.querySelectorAll(".logout-btn, #logoutBtn").forEach(btn => btn.style.display = "none");
    }
  });

  // Logout
  document.querySelectorAll("#logoutBtn").forEach(btn => {
    btn.addEventListener("click", logoutUser);
  });

  listenAuthChanges();
});document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("picture");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an image");
    return;
  }

  const uploadBtn = document.querySelector("#uploadForm button[type='submit']");
  uploadBtn.disabled = true;
  uploadBtn.innerText = "Uploading to Cloud...";

  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    console.log("File selected:", file.name);

    // ✅ Perform Real Upload to Firebase Storage in Step 2!
    const fileRef = ref(storage, `submissions/${user.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const imageUrl = await getDownloadURL(fileRef);

    // Save strictly the URL so it persists powerfully over page reloads!
    localStorage.setItem("uploadedImageUrl", imageUrl);

    alert("Upload successful ✅\nImage securely saved to Cloud!");

    // ✅ Complete step 2
    await completeStep(2);

    // Close modal
    hideModal("uploadModal");
  } catch (err) {
    console.error(err);
    alert("Upload Failed: " + err.message);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.innerText = "Upload";
  }
});


document.getElementById("detailsForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;

  if (!title || !description) {
    alert("Please fill all fields");
    return;
  }

  console.log("Title:", title);
  console.log("Description:", description);

  // ✅ Save locally (optional)
  localStorage.setItem("title", title);
  localStorage.setItem("description", description);

  alert("Details saved ✅");

  // ✅ Complete Step 3
  await completeStep(3);

  // Close modal
  hideModal("detailsModal");
});


document.getElementById("finalizeBtn").addEventListener("click", async () => {
  const finalizeBtn = document.getElementById("finalizeBtn");
  finalizeBtn.disabled = true;
  finalizeBtn.innerText = "Submitting...";

  const title = localStorage.getItem("title");
  const description = localStorage.getItem("description");
  const imageUrl = localStorage.getItem("uploadedImageUrl");

  if (!imageUrl) {
    alert("Missing Picture! Please complete Step 2 to securely upload your image. ❌");
    finalizeBtn.disabled = false;
    finalizeBtn.innerText = "Confirm & Submit";
    return;
  }
  
  if (!title || !description) {
    alert("Missing Details (Title/Description). Please complete Step 3. ❌");
    finalizeBtn.disabled = false;
    finalizeBtn.innerText = "Confirm & Submit";
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    // 1. Get ML Score directly from ML Service using the description
    const mlResponse = await fetch("http://127.0.0.1:6000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description })
    });

    if (!mlResponse.ok) {
      const errData = await mlResponse.json();
      throw new Error(errData.error || "ML Service Error");
    }
    const mlData = await mlResponse.json();
    const mlScore = mlData.score;

    // 2. Save complete finalized node directly to Firebase Firestore
    const submissionRef = doc(db, "submissions", user.uid + "_" + Date.now());
    await setDoc(submissionRef, {
      uid: user.uid,
      title,
      description,
      imageUrl,
      mlScore,
      timestamp: new Date().toISOString()
    });

    // 4. Update the user's points safely using increment
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      points: increment(mlScore)
    });

    console.log("Submission fully saved locally without Node.js!");

    // Output score alert
    alert(`Submission successful 🎉\nYour ML Score is: ${mlScore}`);

    // Complete Step 4
    await completeStep(4);

    // Clean up
    hideModal("confirmModal");
    localStorage.removeItem("title");
    localStorage.removeItem("description");

  } catch (err) {
    console.error(err);
    alert(`Submission Error: ${err.message}`);
  } finally {
    finalizeBtn.disabled = false;
    finalizeBtn.innerText = "Confirm & Submit";
  }
});