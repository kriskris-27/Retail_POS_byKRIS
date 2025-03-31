const mongoose = require("mongoose");//import mongo db


//schema
//the structure or object

const productSchema = mongoose.Schema({
    name:{type:String,required:true,},
price:{type:Number,required:true},
costPrice:{type:Number,required:true},
stock:{type:Number,required:true},
category:{type:String,required:true},
expiryDate:{type:Date}},
{timestamps:true});

productSchema.methods.isExpired = function () {
    return this.expiryDate && new Date(this.expiryDate) < new Date();
  };
//model
//(why model ??? (To interact with this schema in MongoDB, we need to use mongoose.model()))


const Product = mongoose.model("Product",productSchema);



//make it accessible for all

module.exports =Product;