import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { CreateVendor, GetallVendors, GetVendorsById } from "../controllers/index.js";
import { Auth } from "../middleware/Auth.js";

const router = express.Router();  



router.post("/createvendor",CreateVendor); 
router.get("/getallvendors",Auth,GetallVendors); 
router.get("/vendor/:id",Auth,GetVendorsById);   



router.get("/", (req: Request, res: Response, next: NextFunction) => {
    return res.send({message:"Hello from admin Route"}).status(200)
});

export { router as AdminRoutes };
