const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const admin = require("firebase-admin");

const app = express();

// Initialize Firebase Admin for token verification (projectId only)
try {
  admin.initializeApp({ projectId: "neeraksh-1736" });
  console.log("🔥 Firebase Admin initialized");
} catch (e) {
  console.error("Firebase Admin initialization error:", e);
}

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/neeraksh", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("📦 Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", require("./routes/submission.routes"));

// Test route
app.get("/", (req, res) => {
  res.send("✅ Neeraksh Backend is running");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
