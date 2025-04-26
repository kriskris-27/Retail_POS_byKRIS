const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    const token = req.cookies.token;
    console.log("Cookies received:", req.cookies);

  
    try {
        
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
      console.log("Cookies received:", req.cookies);

    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
  

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

const adminOrManager=(req,res,next)=>{
    if(req.user.role!=="admin" && req.user.role!=="manager"){
        return res.status(403).json({message:"Access denied.Admin or Manager only."})
    }
    next()
}
const cashierOrAdmin=(req,res,next)=>{
    if(req.user.role!=="admin" && req.user.role!=="cashier"){
        return res.status(403).json({message:"Access denied.Cashiers or Admin only."})
    }
    next()
}


module.exports={protect,adminOnly,cashierOnly,adminOrManager,cashierOrAdmin}