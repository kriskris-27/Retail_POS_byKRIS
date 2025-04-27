const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    // Try to get token from cookies first
    let token = req.cookies.token;
    
    // If no cookie token, try to get from Authorization header
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token verification error:", err);
        res.status(401).json({ message: "Invalid token" });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
};

const cashierOnly = (req, res, next) => {
    if (req.user?.role !== "cashier") {
        return res.status(403).json({ message: "Access denied. Cashiers only." });
    }
    next();
};

const adminOrManager = (req, res, next) => {
    if (req.user?.role !== "admin" && req.user?.role !== "manager") {
        return res.status(403).json({ message: "Access denied. Admin or Manager only." });
    }
    next();
};

const cashierOrAdmin = (req, res, next) => {
    // Check if user exists and has a role
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    // Check if role is either admin or cashier
    if (req.user.role === "admin" || req.user.role === "cashier") {
        next();
    } else {
        return res.status(403).json({ message: "Access denied. Only Cashiers and Admins are allowed." });
    }
};

module.exports = {
    protect,
    adminOnly,
    cashierOnly,
    adminOrManager,
    cashierOrAdmin
};