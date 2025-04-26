const express= require("express")
const { adminOnly, protect } = require("../middleware/authMiddleware");
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/adminCont");


router.get('/',getUsers);
router.post('/create',createUser);
router.put('/update/:id',updateUser);
router.delete('/delete/:id',deleteUser);

module.exports= router

