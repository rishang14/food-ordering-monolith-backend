import { Queue } from "bullmq";
import { redisConfig } from "../../utility/redis.config.ts";

interface Orderdetails {
  type: string;
  param: {
    vendorId: string;
    userId: string;
    orderId: string;
  };
}

export const autoOrderCancellationQueue = new Queue("autoOrderCancellationQueue", {
  connection: redisConfig,
});

export async function addOrderjob(job: Orderdetails) { 
  console.log("added successfully")
return  await autoOrderCancellationQueue.add(job.type,job.param,{delay:20*1000,removeOnComplete:true,removeOnFail:true});
}


export async function remvoeOrderJob(jobId:string){
    return await autoOrderCancellationQueue.remove(jobId)
}