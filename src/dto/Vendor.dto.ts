import z from "zod";

export const createvendor = z.object({
  name: z.string().min(5, "min 5 char are required "),
  address: z.string().min(1, "address is required"),
  foodtype: z.array(z.string()).optional(),
  ownername: z.string().min(1, "ownername is required"),
  email: z.string().email("invalid email"),
  phone: z.string().min(7, "phone is too short").max(15, "phone is too long"), 
  password:z.string().min(7,"password must be 7 letter"), 
  pincode:z.number().min(4,"pincode must be 4 number")
});
