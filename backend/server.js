const express = require("express")
const cors =require("cors")
const dotenv =require("dotenv");
const connectDB = require("./config/db")

dotenv.config(); //to load env variables
//step2 call to connect
connectDB();

const app = express(); // express is starts here

app.use(cors()) // manage communication with frontend

app.use(express.json()); //we can just communicate by using cors but what data that we are going to communicate i should need to be mentioned json is the format of data

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
//bill
const billRoutes = require("./routes/billRoutes.js");
app.use("/api/bills",billRoutes)
//sales
const salesReportRoutes = require("./routes/salesReportRoutes.js")
    app.use("/api/reports",salesReportRoutes)
//inventory
const inventoryRoutes=require("./routes/inventoryRoutes.js")
    app.use("/api/inventory",inventoryRoutes);
//Invoice PDF
const billingRoutes = require("./routes/billingRoutes.js");
app.use("/api/billing",billingRoutes);