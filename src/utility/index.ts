import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"


interface AuthPayload {
  name: string;
  email: string;
  _id: string;
}

export const HashPassword = async (password: string) => {
  const pass = await bcrypt.hash(password, 10);

  return pass;
};

export const isPassEqual = async (password: string, hashPassword: string) => {
  console.log(password, "password");
  console.log(hashPassword, "hashpassword");
  return await bcrypt.compare(password, hashPassword);
};

export const GenrateToken = async (payload: AuthPayload) => {
  const token = await jwt.sign(payload,process.env.SECRET!,{
   expiresIn:"1D"
  }); 
  return token;
}; 


export const VerifyToken=async(token:string)=>{
 try {
   const verified= await jwt.verify(token,process.env.SECRET!); 
  console.log(verified) 
  return {success:true, token:verified}
 } catch (error) {
  return {success:false,token:null};
 }
}


export const generateOtpAndExpiry=()=>{  
  const currtime= new Date(); 
  const add1hr= new Date(currtime.getTime() + 5 * 60000); 

  const expiry= add1hr.toLocaleTimeString('en-GB', { hour12: false });

   return {otp:Math.floor(100000 + Math.random() * 900000), expiry }
}