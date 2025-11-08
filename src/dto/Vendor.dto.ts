import z from "zod";

export const createvendor = z.object({
  name: z.string().min(5, "min 5 char are required "),
  address: z.string().min(1, "address is required"),
  foodType: z.array(z.string()).optional(),
  ownername: z.string().min(1, "ownername is required"),
  email: z.email("invalid email"),
  phone: z.string().min(7, "phone is too short").max(15, "phone is too long"), 
  password:z.string().min(7,"password must be 7 letter"), 
  pincode:z.number().min(4,"pincode must be 4 number")
});




export const LoginSchema= z.object({
    email:z.email("email is required"),
    password:z.string().min(7,"password must be 7 letter")
})

export const vendorInputs= createvendor.partial();  


export const VendorServiceInputs=z.object({
  serviceAvailable:z.boolean()
})  

export const FoodInput = z.object({
  foods: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().min(1, "Description is required"),
      category: z.enum(["Veg", "Non-Veg"],{
        error:"Cateogry is requierd",
      }),
      foodType: z.string().min(1, "Food type is required"),
      readyTime: z.number().optional(),
      price: z.number().min(1, "Price must be greater than 0"),
      rating: z.number().default(0),
      images: z.array(z.string()).optional(),
    })
  ),
});

