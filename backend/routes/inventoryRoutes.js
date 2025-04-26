const express = require("express");
const {protect,adminOrManager} = require("../middleware/authMiddleware")
const {lowStock, expiringProducts}= require("../controllers/inventoryCont")
const router=express.Router();


router.get("/low-stock",lowStock)

router.get("/expiring-soon",expiringProducts);


module.exports = router;