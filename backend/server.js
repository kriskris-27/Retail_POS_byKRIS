const express = require("express")
const cors =require("cors")
const dotenv =require("dotenv");
const connectDB = require("./config/db")
const cookieParser = require("cookie-parser");

dotenv.config(); //to load env variables
//step2 call to connect
connectDB();

const app = express(); // express is starts here

app.use(cors({
    origin: "http://localhost:5173", // Replace with actual frontend URL
    credentials: true, // Important for cookies
  })); // manage communication with frontend

app.use(express.json()); //we can just communicate by using cors but what data that we are going to communicate i should need to be mentioned json is the format of data
app.use(cookieParser());

const PORT = process.env.PORT ||  5000

//test route
app.get('/',(req,res)=>{
    res.send("HI from Retail backend API ")
});
app.listen(PORT ,()=>{
    console.log(`Server is running on PORT  ${PORT}`);
})


//all routes which will be in action
//products
const productRoutes = require("./routes/productRoutes");
app.use("/api/products",productRoutes)
//user
const userRoutes = require("./routes/userRoutes.js");
app.use("/api/users", userRoutes);

//sales report (daily,weekly,monthly)
const salesReportRoutes = require("./routes/salesReportRoutes.js")
    app.use("/api/reports",salesReportRoutes)
    
//inventory
const inventoryRoutes=require("./routes/inventoryRoutes.js")
    app.use("/api/inventory",inventoryRoutes);

//Invoice PDF
const billingRoutes = require("./routes/billingRoutes.js");
app.use("/api/billing",billingRoutes);

//Advanced sales report with profit generation
const advancedreport=require("./routes/reportRoutes.js");
app.use("/api/advanced-reports",advancedreport)

//Admin 
const adminAuth=require("./routes/adminRoutes.js");
app.use("/api/admin",adminAuth)