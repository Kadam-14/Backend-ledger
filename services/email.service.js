// 📧 Import Nodemailer - used for sending emails from Node.js
const nodemailer = require('nodemailer');

// 🚀 Create transporter (connection with email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// 🎉 Send welcome email after user registration
async function sendRegisterationEmail(useremail, name) {
  const subject = 'Welcome to Backend Ledger!';

  const text = `Hello ${name},

        Thank you for registering at Backend Ledger.
        We're excited to have you on board!

        Best regards,
    The Backend Ledger Team`;

  const html = `<p>Hello ${name},</p>
<p>Thank you for registering at Backend Ledger. We're excited to have you on board!</p>
<p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(useremail, subject, text, html);
}

async function sendTransactionSuccessEmail(useremail, name, amount, toAccount,  transactionId) {
      const subject = 'Transaction Successful ✅';
      const text = `Hello ${name},

              Your transaction was successful!

              Amount: ₹${amount}
              Transaction ID: ${transactionId}

              Thank you for using Backend Ledger.

              Best regards,
              The Backend Ledger Team`;

                const html = `
              <p>Hello ${name},</p>

              <p>Your transaction was <strong style="color:green;">successful</strong>! 🎉</p>

              <ul>
                <li><strong>Amount:</strong> ₹${amount}</li>
                <li><strong>Transaction ID:</strong> ${transactionId}</li>
              </ul>

              <p>Thank you for using Backend Ledger.</p>

              <p>Best regards,<br>The Backend Ledger Team</p>
              `;

  await sendEmail(useremail, subject, text, html);
}

async function sendTransactionFailedEmail(useremail, name, amount, toAccount) {
        const subject = 'Transaction Failed ❌';
         const text = `Hello ${name},

        Unfortunately, your transaction could not be completed.

        Amount: ₹${amount}
        Transaction ID: ${transactionId}

        Please try again or contact support if the issue persists.

        Best regards,
        The Backend Ledger Team`;

            const html = `
        <p>Hello ${name},</p>

        <p>Your transaction was <strong style="color:red;">unsuccessful</strong>.</p>

        <ul>
          <li><strong>Amount:</strong> ₹${amount}</li>
          <li><strong>Transaction ID:</strong> ${transactionId}</li>
        </ul>

        <p>Please try again or contact support if the issue persists.</p>

        <p>Best regards,<br>The Backend Ledger Team</p>
        `;

            await sendEmail(useremail, subject, text, html);
        }



module.exports = {
  sendRegisterationEmail,
  sendTransactionSuccessEmail,
  sendTransactionFailedEmail
}