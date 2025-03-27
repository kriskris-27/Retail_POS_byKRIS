const mongoose = require("mongoose")

const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`🔥 MongoDB Connected: ${conn.connection.host}`);//success
        
    }catch(error){
        console.error(`❌ Error: ${error.message}`);//error
        process.exit(1);//exit process if fails
    }
}

module.exports = connectDB;