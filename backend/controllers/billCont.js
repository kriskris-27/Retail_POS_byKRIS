const Bill = require("../models/billModel");

exports.saveBill = async(req,res)=>{
    try{
        const {items,totalAmount,paymentMethod}=req.body;
        const bill=new Bill({
            items,totalAmount,paymentMethod,cashier:req.user._id,
        })
        const savedBill = await bill.save();
        res.status(200).json({message:"bill saved succesfully cashier\n",savedBill})
    }
    catch(error){
        res.status(500).json({message:"Error in processing bill",error})
    }
}

exports.fetchBill=async (req,res)=>{
    try{
        const bills =await Bill.find().populate("cashier","name").populate("items.product","name price");
        res.json(bills);
    }catch(error)
    {
        res.status(500).json({message:"Error fetching bills"});
    }
}