import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "./logger";
dotenv.config();


const otpTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL_USER,
    pass: process.env.NODEMAILER_EMAIL_PASS,
  },
});

export interface IMailService {
  sendOtp(to: string, otp: string, subject?: string): Promise<void>;
  sendOtpEmail(to: string, text: string, subject?: string): Promise<void>;
}

export class MailService implements IMailService {

  async sendOtp(to: string, otp: string, subject: string = "Your OTP Code"): Promise<void> {
    try {
      await otpTransporter.sendMail({
        from: `"OTP Service" <${process.env.NODEMAILER_EMAIL_USER}>`,
        to,
        subject,
        text: `Your OTP code is: ${otp}. It expires in 1:30 minutes.`,
      });
      logger.info(otp)
      logger.info(`OTP email sent to ${to} with subject: ${subject}`);
    } catch (error: any) {
      logger.error(`Failed to send OTP email to ${to}:`, error);
      throw new Error("Failed to send email");
    }
  }
  
  async sendOtpEmail(to: string, text: string, subject: string): Promise<void> {
    try {
      await otpTransporter.sendMail({
        from: process.env.NODEMAILER_EMAIL_USER,
        to,
        subject,
        text
      });
    } catch (error: any) {
      logger.error(`Failed to send link email to ${to}:`, error);
      throw new Error("Failed to send email");
    }
  }
}

