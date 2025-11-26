import { Worker,Job } from "bullmq"
import { redisConfig } from '../../utility/redis.config.ts';
import { sendOtpEmail } from "../../utility/email/email.helper.ts";
import dotenv from "dotenv" 


dotenv.config();

const worker= new Worker("sendOtpEmailQueue",async(job:Job)=>{
    const emailSend= await sendOtpEmail(job.data.name,job.data.email,job.data.otp); 
    console.log("emailsend",emailSend);  
    const status= job.finishedOn; 
    console.log("status",status);   

    return emailSend;
},{connection:redisConfig  
  });




worker.on('error', err => {
  console.error(err);
});  

worker.on("completed", job => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`❌ Job ${job?.id} failed:`, err);
});