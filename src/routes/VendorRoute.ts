import express from "express";
import {
  vendorLogin,
  getVendorProfile,
  updateProfile,
  updateService,
  addFoods,
  getFoods,
  acceptOrder,
  rejectOrder,
} from "../controllers/index.ts";
import { Auth } from "../middleware/Auth.ts";

const router = express.Router();

router.post("/login", vendorLogin);

router.use(Auth);
router.get("/profile", getVendorProfile);
router.patch("/profile", updateProfile);
router.put("/update-service", updateService);
router.post("/addfoods", addFoods);
router.get("/getfoods", getFoods);
router.put("/acceptorder/:orderId",acceptOrder);
router.put("/rejectorder/:orderId",rejectOrder)

export { router as VendorRoutes };
