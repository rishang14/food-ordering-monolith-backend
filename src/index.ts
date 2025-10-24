import express from "express";
import dotenv from "dotenv";
import { ConnectDb } from "./services/db.js";
import { AdminRoutes, VendorRoute } from "./routes/index.js";

dotenv.config();
const app = express();
app.use(express.json());

await ConnectDb();

app.use("/admin", AdminRoutes);
app.use("/vendor", VendorRoute);

app.use("/", (req, res) => {
  return res.send("server is runing ").status(200);
});

app.listen(8000, () => {
  console.log("Listenning on port :8000");
});
