import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendReminderEmail(email: string, subject: string, text: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"Mind Garden" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: subject,
      text: text,
      html: html,
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
}


export default sendReminderEmail;