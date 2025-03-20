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

async function sendReminderEmail(
  email: string,
  subject: string,
  text: string,
  html: string,
): Promise<string | null> {
  try {
    const info = await transporter.sendMail({
      from: `"Mind Garden" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject,
      text,
      html,
    });
    // Log to server console
    console.log(`Email sent to ${email} with messageId: ${info.messageId}`);
    return info.messageId; // Return messageId for verification
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
    return null; // Return null on failure
  }
}

export default sendReminderEmail;
