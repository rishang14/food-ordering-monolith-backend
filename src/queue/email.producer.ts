import { Queue } from "bullmq";
import { redisConfig } from "./redis.config.js";

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

export async function addjob(job: job) {
  await sendOtpEmailQueue.add(job.type, job.param);
}
