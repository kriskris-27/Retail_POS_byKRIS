const express = require("express");
const { protect, cashierOrAdmin, adminOnly } = require("../middleware/authMiddleware");
const { saveInvoice, generatePDF, fetchBill, deleteBills } = require("../controllers/billingCont");
const router = express.Router();

// Apply protect middleware to all routes first
router.use(protect);

// Then apply role-specific middleware
router.post("/create", cashierOrAdmin, saveInvoice);
router.get("/", cashierOrAdmin, fetchBill);
router.get("/invoice/:billId", cashierOrAdmin, generatePDF);
router.delete("/", adminOnly, deleteBills);

module.exports = router;
