import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { CreateVendor } from "../controllers/Admin.js";

const router = express.Router();  



router.post("/createvendor",CreateVendor);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    return res.send({message:"Hello from admin Route"}).status(200)
});

export { router as AdminRoutes };
