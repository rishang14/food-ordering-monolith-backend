import bcrypt from "bcrypt"



export const HashPassword=async(password:string)=>{
  const pass= await bcrypt.hash(password,10); 

  return pass;
}