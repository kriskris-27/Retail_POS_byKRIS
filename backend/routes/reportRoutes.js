const express=require("express");
const {protect,adminOrManager} = require("../middleware/authMiddleware");
const { salesReport }=require("../controllers/reportCont")

const router= express.Router();

router.get("/sales-report",salesReport);

module.exports=router