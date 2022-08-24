module.exports = {
    authorize(req, res, next) {
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