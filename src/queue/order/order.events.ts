import { Job, QueueEvents } from "bullmq";
import { autoOrderCancellationQueue } from "./order.producer.ts";




export const orderEvents= new QueueEvents("autoOrderCancellationQueue")   

orderEvents.on('completed', async ({ jobId}) => {
  const job = await Job.fromId(autoOrderCancellationQueue, jobId);
  console.log("order return value",job?.returnvalue);
});