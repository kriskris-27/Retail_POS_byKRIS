const express= require("express");
const { cashierOrAdmin, adminOnly } = require("../middleware/authMiddleware");
const { saveInvoice, generatePDF, fetchBill, deleteBills } = require("../controllers/billingCont");
const router = express.Router();

// Simplified routes without token checks
router.post("/create", cashierOrAdmin, saveInvoice);
router.get("/", fetchBill);
router.get("/invoice/:billId", generatePDF);
router.delete("/", adminOnly, deleteBills);

module.exports = router;
