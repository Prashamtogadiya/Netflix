const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");
const { authenticate, verifyAdmin } = require("../middlewares/auth.middleware");

// GET all modes
router.get("/modes", async (req, res) => {
  try {
    let doc = await Setting.findOne({ type: "modes" });
    res.json({ modes: doc?.modes || [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch modes" });
  }
});

// POST add a new mode (admin only)
router.post("/modes", authenticate, verifyAdmin, async (req, res) => {
  const { mode } = req.body;
  if (!mode || typeof mode !== "string" || !mode.trim()) {
    return res.status(400).json({ message: "Mode is required" });
  }
  try {
    let doc = await Setting.findOne({ type: "modes" });
    if (!doc) {
      doc = await Setting.create({ type: "modes", modes: [mode] });
    } else {
      if (doc.modes.includes(mode)) {
        return res.status(400).json({ message: "Mode already exists" });
      }
      doc.modes.push(mode);
      await doc.save();
    }
    res.json({ message: "Mode added", mode });
  } catch (err) {
    res.status(500).json({ message: "Failed to add mode" });
  }
});

// POST set current mode (admin only)
router.post("/hero-mode", authenticate, verifyAdmin, async (req, res) => {
  const { mode } = req.body;
  if (!mode || typeof mode !== "string" || !mode.trim()) {
    return res.status(400).json({ message: "Mode is required" });
  }
  try {
    let modesDoc = await Setting.findOne({ type: "modes" });
    if (!modesDoc || !Array.isArray(modesDoc.modes) || modesDoc.modes.length === 0) {
      return res.status(400).json({ message: "No modes available. Please add a mode first." });
    }
    const normalizedModes = modesDoc.modes.map(m => (typeof m === "string" ? m : String(m)));
    const found = normalizedModes.find(m => m.toLowerCase() === mode.toLowerCase());
    if (!found) {
      return res.status(400).json({ message: "Mode does not exist" });
    }
    // Set the selected mode as the 'mode' field in the "modes" document
    modesDoc.mode = found;
    await modesDoc.save();
    res.json({ heroMode: found });
  } catch (err) {
    console.error("Failed to set hero mode:", err);
    res.status(500).json({ message: "Failed to set hero mode", error: err.message });
  }
});

// GET current mode
router.get("/hero-mode", async (req, res) => {
  try {
    // Return the 'mode' field from the "modes" document
    let modesDoc = await Setting.findOne({ type: "modes" });
    if (modesDoc && modesDoc.mode) {
      return res.json({ heroMode: modesDoc.mode });
    }
    // fallback: get first mode from modes array
    const fallback = modesDoc && Array.isArray(modesDoc.modes) && modesDoc.modes.length > 0
      ? modesDoc.modes[0]
      : null;
    res.json({ heroMode: fallback });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hero mode" });
  }
});

module.exports = router;
    

