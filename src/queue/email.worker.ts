import { Worker,Job } from "bullmq"
import { redisConfig } from "./redis.config.js";
 


const worker= new Worker("sendOtpEmailQueue",async(job:Job)=>{
      console.log("job in the worker",job.data,job.name)
},{connection:redisConfig});




worker.on('error', err => {
  console.error(err);
});