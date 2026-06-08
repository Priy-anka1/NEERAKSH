import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhJgpvoB904jiOuMUS4OJ67Yj09vKwkPg",
  authDomain: "neeraksh-1736.firebaseapp.com",
  projectId: "neeraksh-1736",
  storageBucket: "neeraksh-1736.appspot.com",
  messagingSenderId: "196520322540",
  appId: "1:196520322540:web:93b73e1f9e9f9670d64cc9",
  measurementId: "G-QX5DRSXNDJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

