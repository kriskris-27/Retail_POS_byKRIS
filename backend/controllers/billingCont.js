const PDFDocument = require("pdfkit");
const Bill = require("../models/billModel");
const Product = require("../models/productSchMdl");

exports.saveInvoice = async (req, res) => {
    try {
        const { items, paymentMethod } = req.body;

        // Get product details for all items
        const productIds = items.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });

        // Stock validation
        for (const item of items) {
            const product = products.find(p => p._id.toString() === item.product);
            if (!product) return res.status(404).json({ message: "Product not found" });

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${product.name}` });
            }
        }

        // Deduct stock
        for (const item of items) {
            const product = products.find(p => p._id.toString() === item.product);
            product.stock -= item.quantity;
            await product.save();
        }

        // Calculate total
        const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        // Save bill
        const newBill = new Bill({
            items,
            totalAmount,
            paymentMethod,
            cashier: req.user._id
        });

        await newBill.save();
        res.json({ message: "Invoice created successfully", billId: newBill._id });

    } catch (error) {
        console.error("Invoice Error:", error);
        res.status(500).json({ message: "Error generating invoice" });
    }
};


exports.fetchBill = async (req, res) => {
  try {
    const { filterType } = req.query;

    const filter = {};

    if (filterType) {
      const now = new Date();
      let start, end;

      switch (filterType) {
        case "daily":
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          break;

        case "weekly":
          const firstDayOfWeek = new Date(now);
          firstDayOfWeek.setDate(now.getDate() - now.getDay());
          start = new Date(firstDayOfWeek.setHours(0, 0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          break;

        case "monthly":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;

        default:
          return res.status(400).json({ message: "Invalid filter type" });
      }

      filter.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    const bills = await Bill.find(filter)
      .populate("cashier", "name")
      .populate("items.product", "name price");

    res.json(bills);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Error fetching bills" });
  }
};

exports.deleteBills = async (req, res) => {
    const { filterType } = req.query;
  
    try {
      let filter = {};
  
      if (filterType === "daily") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filter.createdAt = { $gte: today };
      } else if (filterType === "weekly") {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        filter.createdAt = { $gte: startOfWeek };
      } else if (filterType === "monthly") {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filter.createdAt = { $gte: startOfMonth };
      }
  
      const result = await Bill.deleteMany(filter);
      res.json({
        message: `Deleted ${result.deletedCount} bill(s) for ${filterType || "all time"}`,
      });
    } catch (error) {
      console.error("Delete Bills Error:", error);
      res.status(500).json({ message: "Error deleting bills" });
    }
  };

exports.generatePDF = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId)
            .populate("items.product", "name price");

        if (!bill) return res.status(404).json({ message: "Invoice not Found" });

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader("Content-Disposition", `attachment; filename=invoice-${bill._id}.pdf`);
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        // Header
        doc
            .fontSize(22)
            .text("RETAIL INVOICE", { align: "center" })
            .moveDown(1);

        // Invoice Info
        doc
            .fontSize(12)
            .text(`Invoice ID: ${bill._id}`)
            .text(`Date: ${new Date(bill.createdAt).toLocaleString()}`)
            .text(`Payment Method: ${bill.paymentMethod}`)
            .moveDown();

        // Table Header
        doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text("Item", 50)
            .text("Qty", 250, undefined, { width: 50, align: "right" })
            .text("Price", 310, undefined, { width: 100, align: "right" })
            .text("Subtotal", 420, undefined, { width: 100, align: "right" })
            .moveDown(0.5);

        doc.font("Helvetica");

        // Table Rows
        bill.items.forEach(item => {
            const name = item.product?.name || "Unknown";
            const price = item.product?.price || item.price;
            const quantity = item.quantity;
            const subtotal = price * quantity;

            doc
                .text(name, 50)
                .text(quantity, 250, undefined, { width: 50, align: "right" })
                .text(`₹${price.toFixed(2)}`, 310, undefined, { width: 100, align: "right" })
                .text(`₹${subtotal.toFixed(2)}`, 420, undefined, { width: 100, align: "right" });
        });

        doc.moveDown(1);

        // Total
        doc
            .font("Helvetica-Bold")
            .fontSize(14)
            .text(`Total: ₹${bill.totalAmount.toFixed(2)}`, { align: "right" });

        doc.moveDown(2);

        // Footer
        doc
            .fontSize(10)
            .font("Helvetica")
            .text("Thank you for shopping with Kris Retail POS.", { align: "center" })
            .text("For support, contact us at support@krisretail.com", { align: "center" });

        doc.end();
    } catch (error) {
        console.error("PDF Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error generating PDF" });
        }
    }
};
