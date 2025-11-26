import { Worker, Job } from "bullmq";
import { redisConfig } from "../../utility/redis.config.ts";
import { Order } from "../../models/Order.model.ts";
import mongoose from "mongoose";
import  dotenv  from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_DB_URL!)
const worker = new Worker(
  "autoOrderCancellationQueue",
  async (job: Job) => {
    const order = await Order.findById(job.data.orderId);
    console.log("hello i am here") 
    if (order?.orderStatus === "Created") { 
      console.log("i got inside the if statement")
      order.orderStatus = "Canceled";
      await order.save();
    }    
   
    const returnOrderVal={
      orderId:order?.id as string,
      vendorId:order?.vendorId,
      userId:order?.userId,
      orderStatus:order?.orderStatus,
      totalPrice:order?.totalAmount,
      items:order?.items
    }

    return  returnOrderVal;
  },
  { connection: redisConfig }
);

worker.on("error", (err) => {
  console.error(err);
});

worker.on('completed', (job:Job) => { 
  console.log("jobidInWORKER",job.id)
});

worker.on("failed", (job, err) => {    
  console.log(`❌ Job ${job?.id} failed:`, err);
});
