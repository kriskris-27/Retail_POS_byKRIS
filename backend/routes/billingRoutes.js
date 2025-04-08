const express= require("express");
const { protect, cashierOrAdmin,adminOnly } =require("../middleware/authMiddleware");
const { saveInvoice, generatePDF, fetchBill ,deleteBills} = require("../controllers/billingCont");
const router= express.Router();


router.post("/create", protect,cashierOrAdmin,saveInvoice);
router.get("/", protect,fetchBill);

router.get("/invoice/:billId",generatePDF);

router.delete("/", protect,adminOnly,deleteBills);


module.exports=router;