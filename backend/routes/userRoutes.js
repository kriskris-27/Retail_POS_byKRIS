const express = require("express")
const router = express.Router();
const { register, login, logout, verifyAuth } = require("../controllers/userCont")

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/verify", verifyAuth)

module.exports = router;