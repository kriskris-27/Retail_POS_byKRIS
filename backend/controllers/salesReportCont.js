const Bill = require("../models/billModel");

exports.dailySales=async(req,res)=>{
    try{
        const today = new Date();
        today.setHours(0,0,0,0);
        const dailySales=await Bill.aggregate([
            {$match:{createdAt:{$gte:today}}},
            {$group:{_id:null,totalSales:{$sum:"$totalAmount"},count:{$sum:1}}}
        ]);
        res.json(dailySales.length ? dailySales[0]:{totalSales:0,count:0});
    }catch(error)
    {
        res.status(500).json({message:"Error fetching daily sales"});
    }
}

exports.monthySales = async (req, res) => {
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthlySales = await Bill.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);
        res.json(monthlySales.length ? monthlySales[0] : { totalSales: 0, count: 0 });
    } catch (error) {
        res.status(500).json({ message: "Error fetching monthly sales", error: error.message });
    }
}

exports.yearlySales= async (req, res) => {
    try {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  
      const yearlySales = await Bill.aggregate([
        { $match: { createdAt: { $gte: startOfYear } } },
        { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
      ]);
  
      res.json(yearlySales.length ? yearlySales[0] : { totalSales: 0, count: 0 });
    } catch (error) {
      res.status(500).json({ message: "Error fetching yearly sales" });
    }
  }

  exports.bestSelling=async(req,res)=>{
    try{
        const bestSellingProducts = await Bill.aggregate([
            { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
        ])
        res.json(bestSellingProducts);
    }catch(error)
    {
        res.status(500).json({ message: "Error fetching best-selling products" });
    }
}
