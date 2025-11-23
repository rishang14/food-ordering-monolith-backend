import { Queue } from "bullmq";
import { redisConfig } from "./redis.config.ts";

interface Orderdetails {
  type: string;
  param: {
    vendorId: string;
    userId: string;
    orderId: string;
  };
}

const autoOrderCancellationQueue = new Queue("autoOrderCancellationQueue", {
  connection: redisConfig,
});

export async function addOrderjob(job: Orderdetails) {
  await autoOrderCancellationQueue.add(job.type,job.param,{delay:3000*10,removeOnComplete:true,removeOnFail:true});
}
