const fs = require('fs')
// 관리자 로그인 아이디와 비밀번호가 저장되어있는 credentials~.js 파일을 임포트함
let credentials
if (fs.existsSync(__dirname + '/credentials.js')) {
    credentials = require('../credentials')
} 
else {
    credentials = require('../credentials~')
}

module.exports = {
    validate(id, pw) {
        if (id === credentials.adminId) {
            if (pw === credentials.adminPw) {
                req.session.isAdmin = true
                console.log('isAdmin: ' + req.session.isAdmin)
            }
            else {
                console.log('failure - wrong pw')
            }
        }
        else {
            console.log('failure - wrong id')
        }
    },
}