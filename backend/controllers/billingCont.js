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

        if (!bill) {
            return res.status(404).json({ message: "Invoice not Found" });
        }

        const doc = new PDFDocument({ 
            margin: 40,
            size: 'A4',
            bufferPages: true
        });

        res.setHeader("Content-Disposition", `attachment; filename=invoice-${bill._id}.pdf`);
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        // Set fonts
        const primaryFont = 'Helvetica';
        const boldFont = 'Helvetica-Bold';
        const headerFont = 'Times-Roman';

        // Add company info
        doc
            .font(headerFont)
            .fontSize(20)
            .text('BUSINESS RETAIL', { align: 'center' })
            .fontSize(10)
            .text('123 Business Street, City, State - 100001', { align: 'center' })
            .text('Phone: +91 9876543210', { align: 'center' })
            .moveDown(1);

        // Add a horizontal line
        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown(1);

        // Invoice title
        doc
            .font(boldFont)
            .fontSize(18)
            .text('INVOICE', { align: 'center' })
            .moveDown(0.5);

        // Invoice Info in two columns
        const invoiceInfo = {
            'Invoice Number': bill._id,
            'Invoice Date': new Date(bill.createdAt).toLocaleDateString(),
            'Payment Method': bill.paymentMethod,
        };

        let infoY = doc.y;
        doc.font(boldFont).fontSize(10);
        
        // Left column
        Object.keys(invoiceInfo).forEach((key, i) => {
            doc.text(`${key}:`, 50, infoY + (i * 15));
        });

        // Right column
        doc.font(primaryFont);
        Object.values(invoiceInfo).forEach((value, i) => {
            doc.text(value, 200, infoY + (i * 15));
        });

        doc.moveTo(50, doc.y + 20)
           .lineTo(550, doc.y + 20)
           .stroke()
           .moveDown(1.5);

        // Table Header
        doc
            .font(boldFont)
            .fontSize(10)
            .fillColor('#333333')
            .text('#', 50, doc.y, { width: 30, align: 'left' })
            .text('Item Description', 90, doc.y, { width: 250, align: 'left' })
            .text('Qty', 340, doc.y, { width: 50, align: 'right' })
            .text('Unit Price', 390, doc.y, { width: 80, align: 'right' })
            .text('Amount', 470, doc.y, { width: 80, align: 'right' })
            .moveDown(0.5);

        // Horizontal line under header
        doc
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown(0.3);

        // Table Rows
        doc.font(primaryFont).fontSize(10);
        bill.items.forEach((item, index) => {
            const position = doc.y;
            const name = item.product?.name || "Unknown";
            const price = item.product?.price || item.price;
            const quantity = item.quantity;
            const subtotal = price * quantity;

            doc
                .text((index + 1).toString(), 50, position, { width: 30, align: 'left' })
                .text(name, 90, position, { width: 250, align: 'left' })
                .text(quantity.toString(), 340, position, { width: 50, align: 'right' })
                .text(`₹${price.toFixed(2)}`, 390, position, { width: 80, align: 'right' })
                .text(`₹${subtotal.toFixed(2)}`, 470, position, { width: 80, align: 'right' })
                .moveDown(0.5);
        });

        // Horizontal line after items
        doc
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown(0.5);

        // Total section
        const totalY = doc.y;
        doc
            .font(boldFont)
            .text('Total Amount:', 390, totalY, { width: 80, align: 'right' })
            .text(`₹${bill.totalAmount.toFixed(2)}`, 470, totalY, { width: 80, align: 'right' });

        doc.moveDown(3);

        // Terms and conditions
        doc
            .font(boldFont)
            .fontSize(10)
            .text('Terms & Conditions:', 50, doc.y)
            .moveDown(0.3);

        doc
            .font(primaryFont)
            .fontSize(9)
            .text('1. Goods once sold will not be taken back or exchanged.', 50, doc.y, { indent: 10 })
            .text('2. Payment should be made in full.', 50, doc.y + 15, { indent: 10 })
            .text('3. Warranty as per manufacturer terms.', 50, doc.y + 30, { indent: 10 })
            .moveDown(2);

        // Footer
        doc
            .fontSize(10)
            .text('Thank you for your business!', { align: 'center' })
            .moveDown(0.3)
            .text('For any queries, please contact: support@retailpos.com | Phone: +91 9876543210', { align: 'center' });

        // Final horizontal line
        doc
            .moveTo(50, doc.y + 10)
            .lineTo(550, doc.y + 10)
            .stroke();

        doc.end();
    } catch (error) {
        console.error("PDF Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error generating PDF" });
        }
    }
};