const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')

const handlers = require('./lib/errorHandlers')
const postDataController = require('./lib/postDataControl')
const admin = require('./lib/admin')
const flashMiddleware = require('./lib/middleware/flash')
const adminMiddleware = require('./lib/middleware/admin.js')

const app = express()
const port = process.env.PORT || 3000

// static middleware
app.use(express.static(__dirname + '/public'))

// handlebars view engine
app.engine('.hbs', expressHandlebars.engine({
    defaultlayout: 'main',
    extname: '.hbs'
}))
app.set('view engine', '.hbs')

// body-parser
app.use(bodyParser.urlencoded({extended: true}))

app.use(cookieParser())
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: 'secret'
}))

app.use(flashMiddleware)
app.use('/admin', adminMiddleware.authorize)
app.use('/admin', adminMiddleware.logoutView)

// general route
app.get('/', (req, res) => {
    const arrangedPosts = postDataController.readDataList()

    res.render('userHome', {
        posts: arrangedPosts
    })
})

app.get('/read/:identifier', (req, res) => {
    const selectedPost = postDataController.readData(req.params.identifier)

    res.render('userRead', {
        post: selectedPost
    })
})

// admin route
app.get('/login', (req, res) => {
    res.render('adminLogin')
})

app.post('/login', (req, res) => {
    const checkAdmin = admin.validate(req.body.adminId, req.body.adminPw)

    switch (checkAdmin) {
        case 'Success':
            req.session.isAdmin = true
            res.locals.isAdmin = req.session.isAdmin
            res.redirect(303, '/admin')
            break
        case 'Failure - wrong id':
            req.session.flash = {
                intro: '틀린 아이디를 입력하셨습니다',
                message: '올바른 아이디를 입력하세요'
            }
            res.redirect(303, '/login')
            break
        case 'Failure - wrong pw':
            req.session.flash = {
                intro: '틀린 비밀번호를 입력하셨습니다',
                message: '올바른 비밀번호를 입력하세요'
            }
            res.redirect(303, '/login')
            break
    }    
})

app.post('/admin/logout', (req, res) => {
    delete req.session.isAdmin
    res.redirect(303, '/')
})

app.get('/admin', (req, res) => {
    const arrangedPosts = postDataController.readDataList()

    res.render('adminHome', {
        posts: arrangedPosts
    })
})

app.get('/admin/read/:identifier', (req, res) => {
    const selectedPost = postDataController.readData(req.params.identifier)

    res.render('adminRead', {
        post: selectedPost
    })
})

app.get('/admin/write', (req, res) => {
    res.render('adminWrite')
})

app.post('/admin/write', (req, res) => {
    // postDataController.saveData는 폼 전송된 정보를 data/post.json에 저장한 뒤 생성한 identifier를 리턴함
    const newPostIdentifier = postDataController.saveData(req.body)
    res.redirect(303, `/admin/read/${newPostIdentifier}`)
})

app.get('/admin/update/:identifier', (req, res) => {
    const selectedPost = postDataController.updateDataRendering(req.params.identifier)
    
    res.render('adminUpdate', {
        post: selectedPost
    })
})

app.post('/admin/update/:identifier', (req, res) => {
    postDataController.updateData(req.params.identifier, req.body)
    
    res.redirect(303, `/admin/read/${req.params.identifier}`)
})

app.post('/admin/delete', (req, res) => {
    postDataController.deleteData(req.body.identifier)

    res.redirect(303, '/admin')
})

// custom 404, 500 page
app.use(handlers.notFound)
app.use(handlers.serverError)

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Express start on http://localhost:${port}`)
    })
} else {
    module.exports = app
}
