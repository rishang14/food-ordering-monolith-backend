import express from "express"; 
import dotenv from "dotenv"
import { ConnectDb } from "./services/db.js";

dotenv.config();
const app = express();

await ConnectDb();

app.get("/", (req,res) => {
  return  res.send("server is runing ").status(200)
});

app.listen(8000, () => {
  console.log("Listenning on port :8000");
});
