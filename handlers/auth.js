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
const port = process.env.PORT || 3000

module.exports = {
    getLoginPage: (req, res) => {
        res.render('admin/login')
    },
    login: (req, res) => {
        const id = req.body.adminId
        const pw = req.body.adminPw

        if (id === credentials.adminId) {
            if (pw === credentials.adminPw) {
                req.session.isAdmin = true
                res.locals.isAdmin = req.session.isAdmin
                res.redirect(303, '/')
            }
            else {
                req.session.flash = {
                    intro: '틀린 아이디를 입력하셨습니다',
                    message: '올바른 아이디를 입력하세요'
                }
                res.redirect(303, '/login')
            }
        }
        else {
            req.session.flash = {
                intro: '틀린 비밀번호를 입력하셨습니다',
                message: '올바른 비밀번호를 입력하세요'
            }
            res.redirect(303, '/login')
        }
    },
    logout: (req, res) => {
        delete req.session.isAdmin
        const absoluteUserHomePath = `${req.protocol}://${req.hostname.replace('admin.', '')}:${port}`
        res.redirect(303, absoluteUserHomePath)
    },
    check: (req, res, next) => {
        if (!req.session.isAdmin) {
            req.session.flash = {
                intro: '관리자 권한이 필요한 서비스입니다',
                message: '관리자 아이디와 비밀번호를 입력하세요'
            }
            res.redirect(303, '/login')
        }
        else {
            res.locals.isAdmin = req.session.isAdmin
            next()
        }
    }
}