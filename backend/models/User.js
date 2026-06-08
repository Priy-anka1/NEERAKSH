const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  uid: String,
  phone: String,
  points: { type: Number, default: 0 }
});

module.exports = mongoose.model("User", UserSchema);
