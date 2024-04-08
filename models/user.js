const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "You must Write First Name"],
  },
  lastName: {
    type: String,
    required: [true, "You must Write LAst Name"],
  },
  email: {
    type: String,
    required: [true, "You must Write Email"],
    unique: true,
    validate: [validator.isEmail, "write an email"],
  },
  password: {
    type: String,
    required: [true, "You must Write pass"],
  },
  Token: {
    type: String,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  avatar: {
    type: String,
    // default: "uploads/profile.jpg",
  },
});

module.exports = mongoose.model("User", userSchema);
