// import { Resend } from 'resend';
// import dotenv from 'dotenv'
// dotenv.config()

// if(!process.env.RESEND_API){
//     console.log("Provide RESEND_API in side the .env file")
// }

// const resend = new Resend(process.env.RESEND_API);

// const sendEmail = async({sendTo, subject, html })=>{
//     try {
//         const { data, error } = await resend.emails.send({
//             from: 'Binkeyit <noreply@amitprajapati.co.in>',
//             to: sendTo,
//             subject: subject,
//             html: html,
//         });

//         if (error) {
//             return console.error({ error });
//         }

//         return data
//     } catch (error) {
//         console.log(error)
//     }
// }

// export default sendEmail


import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Ensure the email credentials are present in the .env file
if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Provide SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS inside the .env file");
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,  // E.g., 'smtp.gmail.com'
    port: process.env.SMTP_PORT,  // Typically 587 for TLS, 465 for SSL
    secure: process.env.SMTP_PORT == 465,  // Use SSL if port is 465
    auth: {
        user: process.env.SMTP_USER,  // Your email address
        pass: process.env.SMTP_PASS,  // Your email password or app-specific password
    },
});

// Send email function
const sendEmail = async ({ sendTo, subject, html }) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,  // Sender's email address
            to: sendTo,                   // Receiver's email address
            subject: subject,             // Email subject
            html: html,                   // HTML content for the email
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendEmail;


