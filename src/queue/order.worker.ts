import { Worker, Job } from "bullmq";
import { redisConfig } from "../utility/redis.config.ts";
import { Order } from "../models/Order.model.ts";
import mongoose from "mongoose";
import  dotenv  from "dotenv";
import { ws } from "../index.ts";

dotenv.config();

await mongoose.connect(process.env.MONGO_DB_URL!)
const worker = new Worker(
  "autoOrderCancellationQueue",
  async (job: Job) => {
    // first check  that after x time later if order is still created not changed then just cancel it and send it via sockets ot both
    //user and vendor
    const order = await Order.findById(job.data.orderId);
    console.log("hello i am here")
    if (order?.orderStatus === "Created") {
      order.orderStatus = "Canceled";
     ws.sendToUser(order.userId,{orderId:order._id,orderStatus:order.orderStatus});
     ws.sendToVendor(order.vendorId,{orderId:order._id,orderStatus:order.orderStatus});
      await order.save();
      //todo tell the user and vendor both via in real time that time limit exceeded order is auto cancel
    }
  },
  { connection: redisConfig }
);

worker.on("error", (err) => {
  console.error(err);
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`❌ Job ${job?.id} failed:`, err);
});
