import nodemailer from "nodemailer";
import fs from "fs";
import path from "path"; 
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const verifyOtpTemplate = fs.readFileSync(
  path.join(__dirname, "./email-template.html"),
  "utf-8"
);

console.log(verifyOtpTemplate, "template");

export const sendOtpEmail = async (name: string,email:string, otp: number) => {
  try {
    console.log("username", name);
    console.log("otp", otp);
    console.log("email",email) 
    console.log("host:",process.env.EMAILHOST); 
    console.log("port",Number(process.env.EMAILPORT)) 
    console.log("email", process.env.EMAILUSER ); 
    
    const tranporter = nodemailer.createTransport({
       host: process.env.EMAILHOST,         
      port: Number(process.env.EMAILPORT), 
      secure: true,                        
      auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASS,
      },
    });    
    

    const send= await tranporter.sendMail({
        from:process.env.EMAILUSER,
        to:email, 
        subject:"Verify user Otp", 
        html:verifyOtpTemplate.replace("{{ user_name }}", name).replace("{{otp}}",otp + "" )
    })

   

    return send;

  } catch (error) {
    console.log("something went wrong while sending the email", error); 
     throw error; 
  }
};
