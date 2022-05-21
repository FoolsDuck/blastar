const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  address: String,
  score: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Player", PlayerSchema);
