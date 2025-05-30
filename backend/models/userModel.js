const mongoose =require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type: String,required: true},
    role:{type:String,enum:["admin","cashier","manager"],default:"cashier"}},
    {timestamps:true})

    //hashing the password

    userSchema.pre("save",async function (next){
        if(!this.isModified("password")) return next();
        const salt = await bcrypt.genSalt(10);
        this.password=await bcrypt.hash(this.password,salt);
        next();
    });

    const User =mongoose.model("User",userSchema);
    module.exports = User;