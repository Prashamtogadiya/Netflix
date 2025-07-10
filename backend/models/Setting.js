const mongoose = require("mongoose");

// Remove unique index on 'type' and add a unique compound index on { type, key }
const settingSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true }, // "modes" or "current"
  modes: [String], // Only for type: "modes"
  mode: String     // Only for type: "modes" (current selected mode)
});

module.exports = mongoose.model("Setting", settingSchema);
settingSchema.index({ type: 1 }, { unique: true });

module.exports = mongoose.model("Setting", settingSchema);
