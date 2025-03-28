const mongoose =require("mongoose")

const billSchema = new mongoose.Schema({
    items:[{
        product:{type:mongoose.Schema.Types.ObjectId,ref:"Product"},
        quantity:{type:Number,required:true},
        price:{type:Number,required:true}
    }],
    totalAmount:{type:Number,required:true},
    paymentMethod:{type:String,enum:["Cash","UPI","Card"],required:true},
    cashier:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
},
{timestamps:true}
);

const Bill = mongoose.model("Bill",billSchema);
module.exports= Bill;

