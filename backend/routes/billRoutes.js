const express=require("express");
const {protect ,cashierOnly} = require("../middleware/authMiddleware")
const {saveBill,fetchBill} = require("../controllers/billCont")
const router =express.Router();


router.post("/",protect,cashierOnly,saveBill);
router.get("/", protect,fetchBill);

module.exports=router;