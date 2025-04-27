const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    // Get user from session
    const user = req.session?.user;
    
    if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    req.user = user;
    next();
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
    if (req.user?.role !== "admin" && req.user?.role !== "cashier") {
        return res.status(403).json({ message: "Access denied. Cashiers or Admin only." });
    }
    next();
};

module.exports = {
    protect,
    adminOnly,
    cashierOnly,
    adminOrManager,
    cashierOrAdmin
};