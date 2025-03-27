const express = require("express")
const User=require("../models/userModel");
const bcrypt =require("bcryptjs");
const router=express.Router();
const jwt = require("jsonwebtoken");

router.post("/register",async (req,res)=>{
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
})

router.post("/login",async (req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message:"Invalid email or password bruh"});

        const isMatch= await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({ message: "Invalid email or password check and come again"});

        const token =jwt.sign({id:user._id,role:user.role},"secretKey",{expiresIn:"1h"});
        res.json({token,role:user.role});
    }
    catch(error){
        res.status(500).json({message:"Error logging in [user]:developer krissss???"})
    }
})
module.exports = router;