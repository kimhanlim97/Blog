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

module.exports = {
    validate(id, pw) {
        if (id === credentials.adminId) {
            if (pw === credentials.adminPw) {
                return 'Success'
            }
            else {
                return 'Failure - wrong pw'
            }
        }
        else {
            return 'Failure - wrong id'
        }
    },
}