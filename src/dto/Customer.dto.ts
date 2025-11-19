import z from "zod" 



export const CreateCustomerSchema=z.object({
    name: z.string().min(5, "min 5 char are required "),
    address: z.string().min(1, "address is required"),
    email: z.email("invalid email"),
    phone: z.string().min(7, "phone is too short").max(15, "phone is too long"), 
    password:z.string().min(7,"password must be 7 letter"),    
})   

export const editCustomerInputs=CreateCustomerSchema.partial();  


export const addtoCartSchema=z.object({
    foodID:z.string().min(10,"id format is wrong"), 
    unit:z.number() 
})