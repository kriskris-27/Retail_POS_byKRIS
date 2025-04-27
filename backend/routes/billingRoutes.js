const express = require("express");
const { protect, cashierOrAdmin, adminOnly } = require("../middleware/authMiddleware");
const { saveInvoice, generatePDF, fetchBill, deleteBills } = require("../controllers/billingCont");
const router = express.Router();

// Protected routes - require authentication
router.post("/create", protect, cashierOrAdmin, saveInvoice);
router.get("/", protect, cashierOrAdmin, fetchBill);
router.delete("/", protect, adminOnly, deleteBills);

// Public route for PDF invoices - no authentication required
router.get("/invoice/:billId", generatePDF);

module.exports = router;
