import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { ConnectDb } from "./services/db.js";
import { AdminRoutes, CustomerRoutes,VendorRoutes } from "./routes/index.js"; 
import type { Request,Response,NextFunction } from "express"; 
import rateLimit from "express-rate-limit"
import http from "http";   
import { RealTime } from "./services/Ws.main.ts";

dotenv.config();

export const app = express();

app.use(express.json());
app.use(cookieParser());
 

const limiter = rateLimit({
	windowMs: 1000 * 30, // 30 sec
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 30 sec).
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	ipv6Subnet: 56,  
  message:{
    status:429,
    error:"Too many request  ,please try again after some time "
  }
})

try {
  await ConnectDb();
  console.log(" Database connected successfully");
} catch (error:any) {
  console.error(" Database connection failed:", error.message);
  process.exit(1); // Exit if DB fails
}

app.use(limiter);
app.use("/admin", AdminRoutes);
app.use("/vendor", VendorRoutes); 
app.use("/customer",CustomerRoutes);

app.use("/", (req, res) => {
  res.status(200).send("Server is running");
});
  



const server=http.createServer(app); 


export const ws=new RealTime(server)   

server.listen(8001, () => {
  console.log("Server running on port 8000");
});



app.use((err:any, req:Request, res:Response, next:NextFunction) => {
  console.error(" Global error caught:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

process.on("uncaughtException", (err) => {
  console.error(" Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

app.listen(8000, () => {
  console.log(" Listening on port 8000");
});
