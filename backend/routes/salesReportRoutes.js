const express =require("express")
const {protect,adminOrManager} = require("../middleware/authMiddleware");
const { dailySales, monthySales, yearlySales, bestSelling }=require("../controllers/salesReportCont")
const router = express.Router()


router.get("/daily",protect,adminOrManager,dailySales);

router.get("/monthly",protect,adminOrManager,monthySales
);

router.get("/yearly", protect, adminOrManager,yearlySales);
  
router.get("/top-products",protect,adminOrManager,bestSelling)

module.exports = router;