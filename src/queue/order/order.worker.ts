import { Worker, Job } from "bullmq";
import { redisConfig } from "../../utility/redis.config.ts";
import { Order } from "../../models/Order.model.ts";
import mongoose from "mongoose";
import  dotenv  from "dotenv";
import { ws } from "../../index.ts";

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
    return order;
  },
  { connection: redisConfig }
);

worker.on("error", (err) => {
  console.error(err);
});

worker.on('completed', (job:Job) => {
  console.log(`✅ Job : ${job.returnvalue}`);    
  console.log("job data", job.data)  
  console.log("job completed")

});

worker.on("failed", (job, err) => {    
  console.log(`❌ Job ${job?.id} failed:`, err);
});
