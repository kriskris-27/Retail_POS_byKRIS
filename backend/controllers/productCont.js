const Product = require("../models/productSchMdl");

exports.listProducts=async(req,res)=>{
    try{
        const products=await Product.find(); //Fetch all products
        res.status(201).json({message:"The products (get function)\n", products})//convert to json
    }catch(error){
        res.status(500).json({message:"Error fetching products",error: error.message})
    }
}

exports.createProduct=async(req,res)=>{
    const {name,price,costPrice,stock,category,expiryDate} = req.body;
    if (!name || !price || !costPrice || !stock || !category) {
        return res.status(400).json({ message: "All fields are required" });
      }
    try{
        const product = new Product({name,price,costPrice,stock,category,expiryDate});
        await product.save();
        res.status(201).json({message:"Successfully created",product});
    }catch(error){
        res.status(500).json({message:"Error adding product"})
    }
}

exports.updateProduct=async (req,res)=>{
    try{
        const pdt = await Product.findById(req.params.id);

        if (!pdt){
            return res.status(404).json({message:"Product Not Found dont get sad bruh"})
        }

        pdt.name=req.body.name || pdt.name;
        pdt.price =req.body.price || pdt.price;
        pdt.stockPrice=req.body.stockPrice || pdt.stockPrice;
        pdt.stock =req.body.stock || pdt.stock;
        pdt.category =req.body.category || pdt.category;
        pdt.expiryDate =req.body.expiryDate || pdt.expiryDate;
        const updatedPdt =await pdt.save(); //save updated pdt
        res.status(202).json({message:"Successfully updated",updatedPdt});
        
    }catch(error){
        res.status(404).json({message:"Error in updating the product call kris",
            error:error.message
        })
    }
}

exports.deleteProduct=async(req,res)=>{
    try{
        const pdt = await Product.findById(req.params.id);// await here because this is a(findById) callback function
        if(!pdt){
            return res.status(404).json({message:"No product found check id sir"})
        }
        await pdt.deleteOne()//delete line await here because this is a(findById) callback function
        res.status(202).json({message:"Successfully deleted"})
        
    }catch(error){
        res.status(500).json({message:"Error deleting the product",
            error:error.message
        })
    }
}