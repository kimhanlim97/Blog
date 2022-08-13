const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')

const data = require('./lib/data')
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
    extname: '.hbs',
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
    const posts = data.read()
    const arrangedPosts = Object.keys(posts).map(id => posts[id])

    res.render('user/home', {
        posts: arrangedPosts
    })
})

app.get('/read/:postId', (req, res) => {
    const selectedPost = data.read(req.params.postId)
    const commentList = selectedPost.comment

    res.render('user/read', {
        post: selectedPost,
        commentList: commentList
    })
})

app.post('/read/:postId/createComment', (req, res) => {
    const comment = req.body
    comment.commentId = data.getRandomId()

    const selectedPost = data.read(req.params.postId)

    if (selectedPost.comment) selectedPost.comment.push(comment)
    else selectedPost.comment = [comment]

    data.update(req.params.postId, selectedPost)

    res.redirect(`/read/${req.params.postId}`)
})

app.get('/read/:postId/updateComment/:commentId', (req, res) => {
    const selectedPost = data.read(req.params.postId)
    const commentList = selectedPost.comment
    const updateComment = commentList.filter((comment, i, self) => {
        return comment.commentId === req.params.commentId
    })

    res.render('user/updateComment', {
        post: selectedPost,
        commentList: commentList,
        updateComment: updateComment[0],
    })
})

app.post('/read/:postId/updateComment/:commentId', (req, res) => {
    const selectedPost = data.read(req.params.postId)
    const updatedComments = selectedPost.comment.map((item) => {
        if (item.commentId === req.params.commentId) {
            const newComment = req.body
            newComment.commentId = req.params.commentId

            return newComment
        } else {
            return item
        }
    })
    selectedPost.comment = updatedComments
    
    data.update(req.params.postId, selectedPost)

    res.redirect(303, `/read/${req.params.postId}`)
})

app.post('/read/:postId/deleteComment/:commentId', (req, res) => {
    const selectedPost = data.read(req.params.postId)
    const deletedCommentId = selectedPost.comment.findIndex((item) => {
        return item.commentId === req.params.commentId
    })
    selectedPost.comment.splice(deletedCommentId, 1)

    data.update(req.params.postId, selectedPost)

    res.redirect(303, `/read/${req.params.postId}`)
})

// admin route
app.get('/login', (req, res) => {
    res.render('admin/login')
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
    const posts = data.read()
    const arrangedPosts = Object.keys(posts).map(id => posts[id])

    res.render('admin/home', {
        posts: arrangedPosts
    })
})

app.get('/admin/read/:id', (req, res) => {
    const selectedPost = data.read(req.params.id)

    res.render('admin/read', {
        post: selectedPost
    })
})

app.get('/admin/write', (req, res) => {
    res.render('admin/write')
})

app.post('/admin/write', (req, res) => {
    const newPost = data.create(req.body)

    res.redirect(303, `/admin/read/${newPost.id}`)
})

app.get('/admin/update/:postId', (req, res) => {
    const selectedPost = data.read(req.params.postId)
    
    res.render('admin/update', {
        post: selectedPost
    })
})

app.post('/admin/update/:postId', (req, res) => {
    data.update(req.params.postId, req.body)
    
    res.redirect(303, `/admin/read/${req.params.postId}`)
})

app.post('/admin/delete', (req, res) => {
    data.delete(req.body.postId)

    res.redirect(303, '/admin')
})

// custom 404, 500 page
app.use((req, res) => res.render('error/404'))

/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
    console.log(err)
    res.render('error/500')
})
/* eslint-disable no-unused-vars */

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Express start on http://localhost:${port}`)
    })
} else {
    module.exports = app
}
