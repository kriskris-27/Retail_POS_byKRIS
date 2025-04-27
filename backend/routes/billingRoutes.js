const express = require("express");
const { protect, cashierOrAdmin, adminOnly } = require("../middleware/authMiddleware");
const { saveInvoice, generatePDF, fetchBill, deleteBills } = require("../controllers/billingCont");
const router = express.Router();

// Apply protect middleware to all routes first
router.use(protect);

// Then apply role-specific middleware
router.post("/create", cashierOrAdmin, saveInvoice);
router.get("/", cashierOrAdmin, fetchBill);
router.delete("/", adminOnly, deleteBills);

// Public route for PDF invoices - no authentication required
router.get("/invoice/:billId", generatePDF);

module.exports = router;
