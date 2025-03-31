const express=require("express");
const {protect,adminOrManager} = require("../middleware/authMiddleware");
const { salesReport }=require("../controllers/reportCont")

const router= express.Router();

router.get("/sales-report",protect,adminOrManager,salesReport);

module.exports=router