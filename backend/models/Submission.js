const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  uid: String,
  imageUrl: String,
  description: String,
  mlScore: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Submission", SubmissionSchema);
