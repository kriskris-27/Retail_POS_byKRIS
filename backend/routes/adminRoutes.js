const express= require("express")
const { adminAuth } = require("../middleware/adminAuthMiddleware");
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/adminCont");


router.get('/',adminAuth,getUsers);
router.post('/create',adminAuth,createUser);
router.put('/update/:id',adminAuth,updateUser);
router.delete('/delete/:id',adminAuth,deleteUser);

module.exports= router

