const mongoose = require("mongoose")

const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser:true, //Prevents old connection warnings
            useUnifiedTopology:true, //Ensures smooth connection handling
        });
        console.log(`🔥 MongoDB Connected: ${conn.connection.host}`);//success
        
    }catch(error){
        console.error(`❌ Error: ${error.message}`);//error
        process.exit(1);//exit process if fails
    }
}

module.exports = connectDB;