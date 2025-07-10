const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");
const { authenticate, verifyAdmin } = require("../middlewares/auth.middleware");
const {getAllModes,addNewMode,setHeroMode,getCurrentHeroMode} = require("../controllers/settings.controller");
// GET all modes
router.get("/modes", getAllModes);

// POST add a new mode (admin only)
router.post("/modes", authenticate, verifyAdmin, addNewMode);

// POST set current mode (admin only)
router.post("/hero-mode", authenticate, verifyAdmin, setHeroMode);

// GET current mode
router.get("/hero-mode",getCurrentHeroMode );

module.exports = router;
    

