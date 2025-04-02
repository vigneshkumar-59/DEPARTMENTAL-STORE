import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

if(!'mongodb://127.0.0.1:27017/grocery_db'){
    throw new Error(
        "Please provide MONGODB_URI in the .env file"
    )
}

async function connectDB(){
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/grocery_db')
        console.log("connect DB")
    } catch (error) {
        console.log("Mongodb connect error",error)
        process.exit(1)
    }
}

export default connectDB