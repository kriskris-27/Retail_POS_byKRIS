const express= require("express");
const { protect, cashierOrAdmin,adminOnly } =require("../middleware/authMiddleware");
const { saveInvoice, generatePDF, fetchBill ,deleteBills} = require("../controllers/billingCont");
const router= express.Router();


router.post("/create", saveInvoice);
router.get("/", fetchBill);

router.get("/invoice/:billId",generatePDF);

router.delete("/",deleteBills);


module.exports=router;