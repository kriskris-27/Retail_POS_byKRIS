const Bill = require("../models/billModel");
const Product = require("../models/productSchMdl");

exports.salesReport=async(req,res)=>{
    try{
        const {period} = req.query;
        let startDate;

        const today = new Date();

        if(period === "daily"){
            startDate=new Date(today.setHours(0,0,0,0));
        }else if(period === "weekly"){
            startDate=new Date(today.setDate(today.getDate()-7));
        }else if(period === "monthly"){
            startDate=new Date(today.setMonth(today.getMonth()-1));
        }else{
            return res.status(400).json({message:"Invalid period"});
        }
        // console.log(period);
        
        const sales = await Bill.find({createdAt:{$gte:startDate}}).populate("items.product");

        let totalRevenue =0;
        let totalProfit=0;

        sales.forEach((bill)=>{
            bill.items.forEach((item)=>{
                if (!item.product) {  // ✅ Check if product exists
                    console.warn(`Warning: Product not found for item ID ${item._id}`);
                    return; // Skip this item
                }
                totalRevenue+=item.price*item.quantity;
                totalProfit+=(item.price-item.product.costPrice)*item.quantity;
            });
        });

        res.json({
            period,
            totalRevenue,
            totalProfit,
            salesCount:sales.length
        })
    } catch (error) {
        console.error("Sales Report Error:", error);
        res.status(500).json({ message: "Error fetching sales report", error });
    }
}