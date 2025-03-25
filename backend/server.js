const express = require("express")
const cors =require("cors")
const dotenv =require("dotenv");
const connectDB = require("./config/db")

dotenv.config();
connectDB();

const app = express(); // express is starts here

app.use(cors()) // manage communication with frontend

app.use(express.json()); //we can just communicate by using cors but what data that we are going to communicate i should need to be mentioned json is the format of data

const PORT = process.env.PORT ||  5000

app.get('/',(req,res)=>{
    res.send("HI from Retail backend API ")
});

app.listen(PORT ,()=>{
    console.log(`Server is running on PORT  ${PORT}`);
    
})