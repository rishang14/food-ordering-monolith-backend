import bcrypt from "bcrypt"



export const HashPassword=async(password:string)=>{
  const pass= await bcrypt.hash(password,10); 

  return pass;
}


export const isPassEqual=async(password:string,hashPassword:string)=>{ 
    console.log(password,"password"); 
    console.log(hashPassword,"hashpassword")
    return await  bcrypt.compare(password , hashPassword)
}