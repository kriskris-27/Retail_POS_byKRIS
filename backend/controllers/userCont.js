const User=require("../models/userModel");
const bcrypt =require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register=async (req,res)=>{
    try{
        const {name ,email ,password , role}=req.body;
        const userExists =await User.findOne({email});
        if (userExists) return res.status(400).json({ message: "User already exists" });
        const user = new User({name,email,password,role});
        await user.save()
        res.status(201).json({ message: "User registered successfully massnow ne" });
    }catch(error){
        res.status(500).json({ message: "Error registering user [kris]:itho varen",error });
    }
}

exports.login=async (req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message:"Invalid email or password bruh"});

        const isMatch= await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({ message: "Invalid email or password check and come again"});

        const token =jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:"1h"});


        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // secure only in production
            sameSite: "None", // for cross-origin cookie
            maxAge: 60 * 60 * 1000, // 1 hour
          })
          .status(200)
          .json({ message: "Login successful", role: user.role });
          
    }
    catch(error){
        res.status(500).json({message:"Error logging in [user]:developer krissss???"})
    }
}

exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
      });
      
      res.status(200).json({ message: "Logged out successfully" });
      
  };
  
  
  