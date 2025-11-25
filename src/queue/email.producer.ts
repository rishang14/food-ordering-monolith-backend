import { Queue } from "bullmq";
import { redisConfig } from "../utility/redis.config.ts";

interface job {
  type: string;
  param: {
    otp: number;
    email: string;
    name: string;
  };
}

const sendOtpEmailQueue = new Queue("sendOtpEmailQueue", {
  connection: redisConfig,
});

export async function addEmailJob(job: job) { 
  // so  queue is initialize  in  a way  that it will retry 3 time with delay of  5sec and retry 3 time
  await sendOtpEmailQueue.add(job.type, job.param,{removeOnComplete:true,removeOnFail:false, attempts:3, backoff:{
    type:"exponential",
    delay:5000
  }});
}
