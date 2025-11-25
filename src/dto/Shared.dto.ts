import type z from "zod"
import type { createvendor, LoginSchema } from "./Vendor.dto.ts"
import type { CreateCustomerSchema } from "./Customer.dto.ts"


export type userType = "Vendor" | "Customer"  
export type createvendorInputs= z.infer<typeof createvendor> 
export  type createCustomerInputs=z.infer<typeof CreateCustomerSchema> 
export  type loginInputs=z.infer<typeof LoginSchema>