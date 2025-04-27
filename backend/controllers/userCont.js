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

        // Set cookie options based on environment
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only use secure in production
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Strict in production
            maxAge: 60 * 60 * 1000, // 1 hour
            path: "/", // Ensure cookie is available for all paths
            domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined // Use environment variable
        };

        // Set cookie for desktop browsers
        res.cookie("token", token, cookieOptions);

        // Send response with token for mobile
        res.status(200).json({ 
            message: "Login successful", 
            role: user.role,
            token: token, // Send token in response for mobile
            userId: user._id, // Send user ID for reference
            user: {
                email: user.email,
                role: user.role
            }
        });
          
    }
    catch(error){
        console.error("Login error:", error);
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

// Add a new endpoint to verify authentication
exports.verifyAuth = async (req, res) => {
    try {
        // Check for token in cookies first
        const token = req.cookies.token;
        
        // If no cookie token, check Authorization header
        const authHeader = req.headers.authorization;
        const headerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        
        const finalToken = token || headerToken;
        
        if (!finalToken) {
            return res.status(401).json({ message: "No authentication token found" });
        }

        try {
            const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);
            res.status(200).json({ 
                message: "Authentication successful",
                user: {
                    id: decoded.id,
                    role: decoded.role
                }
            });
        } catch (err) {
            res.status(401).json({ message: "Invalid token" });
        }
    } catch (error) {
        console.error("Auth verification error:", error);
        res.status(500).json({ message: "Error verifying authentication" });
    }
};
  
  
  