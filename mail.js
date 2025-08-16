require('dotenv').config();
const nodeMailer = require('nodemailer');

const transport = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SUPPORT_USER,
        pass: process.env.SUPPORT_USER_PASS,
    }
});

module.exports = transport;