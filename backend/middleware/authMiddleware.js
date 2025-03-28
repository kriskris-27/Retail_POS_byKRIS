const jwt = require("jsonwebtoken");

const protect = (req,res,next)=>{
    let token = req.header("Authorization");
    if(!token) return res.status(401).json({message:"No token,authorization denied"});

    try{
        const decoded =jwt.verify(token,"secretKey");
        req.user=decoded;
        next();
    }catch(error){
        res.status(401).json({ message: "Invalid token" });
    }
}

const adminOnly = (req,res,next)=>{
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied hey only admins allowed" });
    next();
};

const cashierOnly=(req,res,next)=>{
    if(req.user.role!=="cashier"){
        return res.status(403).json({message:"Access denied.Cashiers only."})
    }
    next()
}

module.exports={protect,adminOnly,cashierOnly}