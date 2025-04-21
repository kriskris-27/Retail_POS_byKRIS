const Product = require("../models/productSchMdl")


exports.lowStock=async (req,res)=>{
    try{
        const lowStockProducts= await Product.find({stock:{$lt:5}});
        if (lowStockProducts.length === 0) {
            return res.json({ message: "No low-stock products" });
          }
        res.json(lowStockProducts)
    }catch(error)
    {
        res.status(500).json({message:"Error fetching low stock products"});
    }
}

exports.expiringProducts=async (req,res)=>{
    try{
        const today= new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate()+7);
        const expiringProducts = await Product.find({expiryDate:{$lte:nextWeek}});
        res.json(expiringProducts)
    }
    catch(error){
        es.status(500).json({ message: "Error fetching expiring products" });
    }
}

