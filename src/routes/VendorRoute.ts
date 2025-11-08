import express from "express";
import {
  vendorLogin,
  getVendorProfile,
  updateProfile,
  updateService,
  addFoods,
  getFoods,
} from "../controllers/index.js";
import { Auth } from "../middleware/Auth.js";

const router = express.Router();

router.post("/login", vendorLogin);

router.use(Auth);
router.get("/profile", getVendorProfile);
router.patch("/profile", updateProfile);
router.put("/update-service", updateService);
router.post("/addfoods", addFoods);
router.get("/getfoods", getFoods);


export { router as VendorRoute };
