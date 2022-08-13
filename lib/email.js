const nodemailer = require('nodemailer')
const nodemailerSG = require('nodemailer-sendgrid')
const htmlToFormattedText = require('html-to-formatted-text')
const fs = require('fs')
const path = require('path')
// 관리자 로그인 아이디와 비밀번호가 저장되어있는 credentials.js 파일을 임포트함, 만약 없다면 백업 파일을 임포트함
let credentials
if (fs.existsSync(path.resolve(__dirname, '../', 'credentials.js'))) {
    credentials = require('../credentials')
}
else {
    credentials = require('../credentials~')
}

module.exports = (subject, html) => {

    const transport = nodemailer.createTransport(
        nodemailerSG({
            apiKey: credentials.sendgridAPI
        })
    )

    return transport.sendMail({
        from: 'kimhanlim97@gmail.com',
        to: 'kimhanlim97@gmail.com',
        subject: subject,
        html: html,
        text: htmlToFormattedText(html)
    }).catch(err => {
        console.log(err.message)
    })
}