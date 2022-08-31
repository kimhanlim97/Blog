const passport = require('passport')
const LocalStrategy = require('passport-local')

const db = require('../models/mongoDbLayer')

passport.serializeUser((admin, done) => {
    done(null, admin.authorId)
})

passport.deserializeUser((authorId, done) => {
    db.getUserByAuthId(authorId)
        .then(admin => {
            done(null, {
                authorId: admin.authorId,
                role: admin.role,
                name: admin.name
            })
        })
        .catch(err => done(err, null))
})

passport.use(new LocalStrategy(function verify(username, password, done) {
    db.getUserByAuthId('admin: rlagksfla123')
        .then(admin => {
            if (admin.authorId === 'admin: ' + username) {
                if (admin.password === password) {
                    return done(null, admin)
                } else {
                    return done(null, false, {
                        intro: '잘못된 PW를 입력하셨습니다',
                        message: '올바른 PW를 입력하세요'
                    })
                }
            } else {
                return done(null, false, {
                    intro: '잘못된 ID를 입력하셨습니다',
                    message: '올바른 ID를 입력하세요'
                })
            }
        })
        .catch(err => done(err, null))     
}))

const port = process.env.PORT || 3000
module.exports = {
    getLoginPage: (req, res) => res.render('admin/login'),
    adminAuthN: (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) return next(err)
            if (!user) {
                req.session.flash = info
                return res.redirect('/login')
            }
            req.logIn(user, (err) => {
                if (err) return next(err)
                return res.redirect('/')
            })
        })(req, res, next)
    },
    adminAuthZ: (req, res, next) => {
        if (!req.user || req.user.role !== 'admin') {
            req.session.flash = {
                intro: '관리자 권한이 필요한 서비스입니다',
                message: '관리자 아이디와 비밀번호를 입력하세요'
            }
            res.redirect(303, '/login')
        }
        else {
            res.locals.isAdmin = req.user.role
            next()
        }
    },
    logout: (req, res) => {
        req.logout((err => {
            if (err) return next(err)
            const absoluteUserHomePath = `${req.protocol}://${req.hostname.replace('admin.', '')}:${port}`
            res.redirect(303, absoluteUserHomePath)
        }))
    },
    
}