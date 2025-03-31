const Bill = require("../models/billModel");
const Product = require("../models/productSchMdl");
const PDFDocument = require("pdfkit");

exports.saveInvoice = async (req, res) => {
    try {
        const { items, paymentMethod } = req.body;

        // Validate stock in a single query for efficiency
        const productIds = items.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });

        for (const item of items) {
            const product = products.find(p => p._id.toString() === item.product);
            if (!product) return res.status(404).json({ message: "Product not found" });

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${product.name}` });
            }
        }

        // Deduct stock & Save product updates
        for (const item of items) {
            const product = products.find(p => p._id.toString() === item.product);
            product.stock -= item.quantity;
            await product.save();
        }

        // Calculate total amount
        const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        // Save the invoice (bill)
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

// Generate PDF Invoice
exports.generatePDF = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId)
            .populate("items.product", "name price");

        if (!bill) return res.status(404).json({ message: "Invoice not Found" });

        const doc = new PDFDocument();
        res.setHeader("Content-Disposition", `attachment; filename=invoice-${bill._id}.pdf`);
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        doc.fontSize(20).text("Your Purchase Invoice", { align: "center" });
        doc.fontSize(14).text(`Total Amount : ₹${bill.totalAmount}`);
        doc.text(`Payment Method: ${bill.paymentMethod}`);
        doc.moveDown();

        doc.fontSize(14).text("Items Purchased:");
        bill.items.forEach((item) => {
            doc.text(`${item.product?.name || "Unknown"} - ₹${item.product?.price || item.price} x ${item.quantity}`);
        });

        doc.moveDown();
        doc.fontSize(8).text("Software by kris", { align: "center" });

        doc.end();
    } catch (error) {
        console.error("PDF Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error generating PDF" });
        }
    }
};
