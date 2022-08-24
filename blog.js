const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const vhost = require('vhost')

const flashMiddleware = require('./lib/middleware/flash')
const sendEmail = require('./lib/email')
const db = require('./models/mongoDbLayer.js')

const adminRouter = require('./admin.blog')

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
    secret: 'secret',
}))

app.use(flashMiddleware)
app.use(vhost('admin.blog.local', adminRouter))

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
    const comments = post.comments
    
    const context = {
        post: {
            id: post._id,
            title: post.title,
            author: post.author,
            mainText: post.mainText,
        },
        comments: comments.map(comment => {
            const commentForView = {
                id: comment._id,
                author: comment.author,
                comment: comment.comment,
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
    const savedCommentId = await db.saveComment(comment, postId)
    await db.updatePost({ _id: postId }, { $push: { comments: savedCommentId } })

    const emailContext = {
        layout: null,  
        subject: post.title,
        state: '생성',
        comment: comment.comment,
        url: 'http://' + req.hostname + ':' + port + `/read/${postId}` 
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
