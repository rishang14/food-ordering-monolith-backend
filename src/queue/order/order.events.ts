import { Job, Queue, QueueEvents } from "bullmq";
import { Order } from "../../models/Order.model.ts";
import { ws } from "../../index.ts";
import { redisConfig } from "../../utility/redis.config.ts";


const autoOrderQueue = new Queue("autoOrderCancellationQueue", {
  connection: redisConfig,
});

export const orderEvents = new QueueEvents("autoOrderCancellationQueue",{
  connection:redisConfig
});

orderEvents.on("completed", async ({ jobId,returnvalue }) => { 
  console.log("jobId",jobId)  
  console.log("orderId",returnvalue?.orderId as string)
  const order = await Order.findById(returnvalue?.orderId as string); 
  const orderVal = {
    orderId: order?._id as string,
    orderStatus: order?.orderStatus,
    items: order?.items,
    price: order?.totalAmount,
  };
  ws.sendToUser(order?.userId as string, orderVal);
  ws.sendToVendor(order?.vendorId as string, orderVal);
});
