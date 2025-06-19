import nodemailer from "nodemailer"
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
   try {
    //sender
    const transporter = nodemailer.createTransport({
        host: "localhost",
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        },
        tls: { rejectUnauthorized: false },
    });
    //recevier
    let mailOptions;
    if (html) {
        mailOptions = {
            from: `"Hospital Application" <${process.env.EMAIL}>`,
            to,
            subject,
            html,
        };
    } else {
        mailOptions = {
            from: `"Hospital Application" <${process.env.EMAIL}>`,
            to,
            subject,
            attachments,
        };
    }
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    // Check and return based on info
    if (info.rejected && info.rejected.length > 0) return false;
    return true;
   } catch (error) {
      console.error("Error sending email:", error)
      return false;
   }
}