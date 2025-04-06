const jwt = require("jsonwebtoken");
const User = require('../models/userModel');

const adminAuth= async(req,res,next)=>{
   
  
    const token = req.cookies.token
        if(!token) return res.status(401).json({message:"No token,authorization denied"});
        // console.log("entered with token");
        try{
            // console.log("entered try");
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
         
        
        const user=await User.findById(decoded.id)
        
        

        if(!user) throw new Error("User not Found");
        if(user.role !=='admin') return res.status(403).json({message:'Acess denied only Admin access'})
        req.user = user
    next();
    }catch(error)
    {
        res.status(401).json({message:"Unauthorized",error});
    }
}
module.exports = {adminAuth}