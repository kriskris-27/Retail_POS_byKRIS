const express= require("express");
const { protect, cashierOrAdmin } =require("../middleware/authMiddleware");
const { saveInvoice, generatePDF } = require("../controllers/billingCont");
const router= express.Router();


router.post("/create", protect,cashierOrAdmin,saveInvoice);

router.get("/invoice/:billId",protect,generatePDF);

module.exports=router;