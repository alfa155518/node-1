const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  comments: [{ body: String, date: Date }],
});

module.exports = mongoose.model("Course", courseSchema);
