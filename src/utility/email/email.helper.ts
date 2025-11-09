import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const verifyOtpTemplate = fs.readFileSync(
  path.join(process.cwd(), "email-template.html"), "utf-8"
);

console.log(verifyOtpTemplate, "template");

export const sendOtpEmail = async (name: string,email:string, otp: number) => {
  try {
    console.log("username", name);
    console.log("otp", otp);

    const tranporter = nodemailer.createTransport({
      service: process.env.EMAILSERVICE,
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
  }
};
