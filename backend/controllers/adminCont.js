const mongoose = require("mongoose");
const User = require("../models/userModel");

exports.getUsers=async(req,res)=>{
    try{
        const users=await User.find();
        res.json(users)
    }catch(error){
        res.status(500).json({message:"Error fetching users"});
    }
}

exports.createUser = async(req,res)=>{
    const {name,email,password,role}= req.body;
    try{
        const newUser=new User({
            name,email,password,role
        })
        await newUser.save();
        res.json({message:"User created successfully",user:newUser})
    }
    catch(error)
    {
        res.status(500).json({message:"Error creating user"});
    }
};

exports.updateUser=async(req,res)=>{
    const {name,email,role}=req.body;
    try{
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({message:"User not found"});

        user.name = name || user.name;
        user.email=email || user.email;
        user.role= role || user.role;
        await user.save();
        res.json({message: "User updated succesfully", user});
    }
    catch(error)
    {
        res.status(500).json({message:"Error updating user"});
    }
}

exports.deleteUser = async (req, res) => {
    try {
        // Validate the ID format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        res.json({ message: "User deleted succesfully" });
    } catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
}