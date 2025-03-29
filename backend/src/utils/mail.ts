import nodemailer from "nodemailer";
import { injectable } from "inversify";
import dotenv from "dotenv";
dotenv.config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL_USER,
    pass: process.env.NODEMAILER_EMAIL_PASS,
  },
});

export interface IMailService {
  sendOtp(to: string, otp: string, subject?: string): Promise<void>;
}

@injectable()
export class MailService implements IMailService {

  async sendOtp(to: string, otp: string, subject: string = "Your OTP Code"): Promise<void> {
    try {
      await transporter.sendMail({
        from: `"OTP Service" <${process.env.NODEMAILER_EMAIL_USER}>`,
        to,
        subject,
        text: `Your OTP code is: ${otp}. It expires in 1:30 minutes.`,
      });
      
      console.log(`OTP email sent to ${to} with subject: ${subject}`);
    } catch (error: any) {
      console.error(`Failed to send OTP email to ${to}:`, error);
      throw new Error("Failed to send email");
    }
  }
}

