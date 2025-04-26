const express= require("express")
const { adminOnly, protect } = require("../middleware/authMiddleware");
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/adminCont");


router.get('/',protect,adminOnly,getUsers);
router.post('/create',protect,adminOnly,createUser);
router.put('/update/:id',protect,adminOnly,updateUser);
router.delete('/delete/:id',protect,adminOnly,deleteUser);

module.exports= router

