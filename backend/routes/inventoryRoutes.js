const express = require("express");
const {protect,adminOrManager} = require("../middleware/authMiddleware")
const {lowStock, expiringProducts}= require("../controllers/inventoryCont")
const router=express.Router();


router.get("/low-stock",protect,adminOrManager,lowStock)

router.get("/expiring-soon",protect,adminOrManager,expiringProducts);


module.exports = router;