const Bill = require("../models/billModel");
const PDFDocument=require("pdfkit");

exports.saveInvoice= async(req,res)=>{
    try{
        const {items,paymentMethod} = req.body;
        
    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) return res.status(404).json({ message: "Product not found" });
  
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Not enough stock for ${product.name}` });
        }
      }
  
      // Deduct stock after validation
      for (const item of items) {
        const product = await Product.findById(item.product);
        product.stock -= item.quantity;
        await product.save();
      }

        const totalAmount=items.reduce((acc,item)=>acc+item.price*item.quantity,0);

        const newBill = new Bill({
            items, 
            totalAmount,
            paymentMethod,
            cashier:req.user._id
        });
        await newBill.save();
        res.json({message:"Invoice created successfully",billId:newBill._id});
    }
    catch(error)
    {
        res.status(500).json({ message: "Error generating invoice" });

    }
}

exports.generatePDF = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId)
            .populate({
                path: "items.product",
                select: "name price", // Only fetch name and price
            });

        if (!bill) return res.status(404).json({ message: "Invoice not Found" });

        const doc = new PDFDocument();
        res.setHeader("Content-Disposition", `attachment; filename=invoice-${bill._id}.pdf`);
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        doc.fontSize(20).text("Your Purchase Invoice", { align: "center" });
        doc.fontSize(14).text(`Total Amount : ₹${bill.totalAmount}`);
        doc.text(`Payment Method: ${bill.paymentMethod}`);
        doc.text("\nItems purchased:\n");

        // Ensure product exists and has a name
        bill.items.forEach((item) => {
            const productName = item.product?.name || "Unknown Product";
            const productPrice = item.product?.price || item.price; // Use saved price if not populated
            doc.text(`${productName} - ₹${productPrice} x ${item.quantity}`);
        });

        doc.fontSize(8).text("Software by kris", { align: "center" });

        doc.end();
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error generating PDF" });
        }
    }
};
