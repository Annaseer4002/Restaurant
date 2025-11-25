import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config();


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
    }    
})

console.log("EMAIL:", process.env.USER_EMAIL);
console.log("PASS:", process.env.USER_PASSWORD ? "SET" : "MISSING");


transporter.verify((error, success) => {
    if (error) {
        console.log("Mailer verification failed:", error);
    } else {
        console.log("Mailer is ready to send messages");
    }
})    




const sendMail = async ({to, subject, text, html, attachments}) => {


    try {

        
    const mailOptions = {
        from: process.env.USER_EMAIL,
        to,
        subject,
        text,
        html,
        attachments

    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent', info.response);
    return info
        
    } catch (error) {
        console.error('error sending mail', error)
        throw error
    }
}

export default sendMail;