import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { ConnectDb } from "./services/db.js";
import { AdminRoutes, CustomerRoutes,VendorRoutes } from "./routes/index.js"; 
import type { Request,Response,NextFunction } from "express";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());


try {
  await ConnectDb();
  console.log("✅ Database connected successfully");
} catch (error:any) {
  console.error("❌ Database connection failed:", error.message);
  process.exit(1); // Exit if DB fails
}


app.use("/admin", AdminRoutes);
app.use("/vendor", VendorRoutes); 
app.use("/customer",CustomerRoutes)

app.use("/", (req, res) => {
  res.status(200).send("Server is running");
});


app.use((err:any, req:Request, res:Response, next:NextFunction) => {
  console.error("🔥 Global error caught:", err);
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
