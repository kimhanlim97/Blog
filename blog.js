const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')

const admin = require('./lib/admin')
const flashMiddleware = require('./lib/middleware/flash')
const adminMiddleware = require('./lib/middleware/admin')
const sendEmail = require('./lib/email')
const db = require('./db.js')

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
app.get('/', async (req, res) => {
    const postList = await db.getPostList()

    const context = {
        postList: postList.map(post => {
            const postForView = {
                id: post._id,
                title: post.title
            }
            return postForView
        })
    }

    res.render('user/home', context)
})

app.get('/read/:postId', async (req, res) => {
    const postId = req.params.postId

    const post = await db.getPost({ _id: postId })
    const commentList = post.comments
    
    const context = {
        post: {
            id: post._id,
            title: post.title,
            author: post.author,
            mainText: post.mainText,
        },
        comment: commentList.map(comment => {
            const commentForView = {
                author: comment.author,
                comment: comment.comment,
                id: comment._id
            }
            return commentForView
        })
    }

    res.render('user/read', context)
})

app.post('/read/:postId/createComment', async(req, res) => {
    const postId = req.params.postId
    const comment = req.body

    const post = await db.getPost({ _id: postId })
    const savedCommentId = await db.saveComment(comment)
    await db.updatePost({ _id: postId }, { $push: { comments: savedCommentId } })

    const emailContext = {
        layout: null,  
        subject: post.title,
        state: '생성',
        comment: comment.comment,
        url: 'http://' + req.hostname + ':' + port + `/read/${req.params.postId}` 
    }

    res.render('email/emailTemplate', emailContext, (err, html) => {
        if (err) console.log(err)
        
        sendEmail(`${post.title}에 변동사항이 있습니다`, html)

        res.redirect(303, `/read/${postId}`)
    })
})

app.get('/read/:postId/updateComment/:commentId', async (req, res) => {
    const postId = req.params.postId
    const updateCommentId = req.params.commentId

    const post = await db.getPost({ _id: postId })
    const commentList = await db.getCommentList({ postId: postId })

    const context = {
        post: {
            id: post._id,
            title: post.title,
            author: post.author,
            mainText: post.mainText,
        },
        comment: commentList.map(comment => {
            const commentForView = {
                id: comment._id.toString(),
                author: comment.author,
                comment: comment.comment,
            }
            if (commentForView.id === updateCommentId) {
                commentForView.update = true
            }
            return commentForView
        })
    }

    res.render('user/updateComment', context)
})

app.post('/read/:postId/updateComment/:commentId', async(req, res) => {
    const postId = req.params.postId
    const commentId = req.params.commentId
    const updatedComment = req.body

    const post = await db.getPost({ _id: postId })
    const previousComment = await db.getPreviousUpdateComment({ _id: commentId }, updatedComment)

    const emailContext = {
        layout: null,  
        subject: post.title,
        state: '수정',
        comment: previousComment.comment,
        updatedComment: updatedComment.comment,
        url: 'http://' + req.hostname + ':' + port + `/read/${postId}`
    }

    res.render('email/emailTemplate', emailContext, (err, html) => {
        if (err) console.log(err)
        
        sendEmail(`${post.title}에 변동사항이 있습니다`, html)
        res.redirect(303, `/read/${postId}`)
    })
})

app.post('/read/:postId/deleteComment/:commentId', async (req, res) => {
    const postId = req.params.postId
    const commentId = req.params.commentId

    const post = await db.getPost({ _id: postId })
    const previousComment = db.getPreviousDeleteComment({ _id: commentId })

    const emailContext = {
        layout: null,  
        subject: post.title,
        state: '삭제',
        comment: previousComment.comment,
        url: 'http://' + req.hostname + ':' + port + `/read/${req.params.postId}`
    }

    res.render('email/emailTemplate', emailContext, (err, html) => {
        if (err) console.log(err)

        sendEmail(`${post.title}에 변동사항이 있습니다`, html)
        res.redirect(303, `/read/${postId}`)
    })
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

app.get('/admin', async (req, res) => {
    const postList = await db.getPostList()

    const context = {
        postList: postList.map(post => {
            const postForView = {
                id: post._id,
                title: post.title
            }
            return postForView
        })
    }

    res.render('admin/home', context)
})

app.get('/admin/read/:postId', async (req, res) => {
    const postId = req.params.postId

    const post = await db.getPost({ _id: postId })
    const commentList = post.comments
    
    const context = {
        post: {
            id: post._id,
            title: post.title,
            author: post.author,
            mainText: post.mainText,
        },
        commentList: commentList.map(comment => {
            const commentForView = {
                id: comment._id.toString(),
                author: comment.author,
                comment: comment.comment,
            }
            return commentForView
        })
    }

    res.render('admin/read', context)
})

app.get('/admin/write', (req, res) => {
    res.render('admin/write')
})

app.post('/admin/write', async (req, res) => {
    await db.savePost(req.body)

    // res.redirect(303, `/admin/read/${postId}`)
    res.redirect(303, '/admin')
})

app.get('/admin/update/:postId', async (req, res) => {
    const post = await db.getPost({ _id: req.params.postId })
    
    const context = {
        post: {
            id: post._id,
            title: post.title,
            author: post.author,
            mainText: post.mainText
        }
    }

    res.render('admin/update', context)
})

app.post('/admin/update/:postId', (req, res) => {
    db.updatePost({_id: req.params.postId}, req.body)
    
    res.redirect(303, `/admin/read/${req.params.postId}`)
})

app.post('/admin/delete', (req, res) => {
    db.deletePost({ _id: req.body.postId })

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
