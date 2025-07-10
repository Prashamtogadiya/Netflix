const Setting = require("../models/Setting");

exports.getAllModes = async (req, res) => {
  try {
    let doc = await Setting.findOne({ type: "modes" });
    if (!doc) {
      return res.status(404).json({ message: "No modes found" });
    }
    res.json({ modes: doc.modes || [] });
  } catch (err) {
    console.error("Failed to fetch modes:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch modes", error: err.message });
  }
};

exports.addNewMode = async (req, res) => {
  try {
    const { mode } = req.body;
    if (!mode || typeof mode !== "string" || !mode.trim()) {
      return res.status(400).json({ message: "Mode is required" });
    }
    let doc = await Setting.findOne({ type: "modes" });
    if (!doc) {
      doc = await Setting.create({ type: "modes", modes: [mode] });
    } else {
      if (doc.modes.includes(mode)) {
        return res.status(400).json({ message: "Mode alreay exists" });
      }
      doc.modes.push(mode);
      await doc.save();
    }
    res.json({ message: "Mode added", mode });
  } catch (err) {
    console.error("Failed to add mode:", err);
    res
      .status(500)
      .json({ message: "Failed to add mode", error: error.message });
  }
};

exports.setHeroMode = async (req, res) => {
  try {
    const { mode } = req.body;
    if (!mode || typeof mode !== "string" || !mode.trim()) {
      return res.status(400).json({ message: "Mode is required" });
    }
    let modesDoc = await Setting.findOne({ type: "modes" });
    if (
      !modesDoc ||
      !Array.isArray(modesDoc.modes) ||
      modesDoc.modes.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "No modes available. Please add a mode first." });
    }
    let found = modesDoc.modes.find(
      (m) => m.toLowerCase() === mode.toLowerCase()
    );
    if (!found) {
      return res.status(400).json({ message: "Mode does not exist" });
    }
    modesDoc.mode = found;
    await modesDoc.save();
    res.status(200).json({ heroMode: found });
  } catch (err) {
    console.error("Failed to ser hero mode:", err);
    res
      .status(500)
      .json({ message: "Failsed to ser hero mode", error: error.message });
  }
};

exports.getCurrentHeroMode = async (req, res) => {
  try {
    // Return the 'mode' field from the "modes" document
    let modesDoc = await Setting.findOne({ type: "modes" });
    if (modesDoc && modesDoc.mode) {
      return res.json({ heroMode: modesDoc.mode });
    }
    // fallback: get first mode from modes array
    const fallback =
      modesDoc && Array.isArray(modesDoc.modes) && modesDoc.modes.length > 0
        ? modesDoc.modes[0]
        : null;
    res.json({ heroMode: fallback });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hero mode" });
  }
};
