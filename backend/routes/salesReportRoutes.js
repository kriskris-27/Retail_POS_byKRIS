const express =require("express")
const {protect,adminOrManager} = require("../middleware/authMiddleware");
const { dailySales, monthySales, yearlySales, bestSelling }=require("../controllers/salesReportCont")
const router = express.Router()


router.get("/daily",dailySales);

router.get("/monthly",monthySales
);

router.get("/yearly",yearlySales);
  
router.get("/top-products",bestSelling)

module.exports = router;