import { z } from "zod";

export const CreateOrderItemSchema = z.object({
  food: z.string().min(1, "Food ID is required"),  // ObjectId as string
  unit: z.number().int().positive("Unit must be > 0"),
});

export const CreateOrderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  items: z
    .array(CreateOrderItemSchema)
    .min(1, "At least one item is required"),
});


export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
