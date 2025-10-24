import mongoose from "mongoose";

export async function ConnectDb() {
  try {
    const connect = await mongoose.connect(process.env.MONGO_DB_URL!);
    console.log("mongodb is connected");
  } catch (error) {
    console.log(error);
  }
}
