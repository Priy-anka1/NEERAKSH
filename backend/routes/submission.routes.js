const express = require("express");
const multer = require("multer");
const axios = require("axios");
const auth = require("../middleware/auth.middleware");
const Submission = require("../models/Submission");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/submit", auth, upload.single("image"), async (req, res) => {
  try {
    const { description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Call ML service
    const mlResponse = await axios.post("http://127.0.0.1:6000/analyze", {
      description: description
    });

    const mlScore = mlResponse.data.score;

    // Save to database
    const newSubmission = new Submission({
      uid: req.user.uid,
      imageUrl: req.file.path, // multer saves file path in req.file.path
      description: description,
      mlScore: mlScore
    });

    await newSubmission.save();

    res.json({
      message: "Submission analyzed successfully",
      score: mlScore,
      submissionId: newSubmission._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ML service error" });
  }
});

module.exports = router;
