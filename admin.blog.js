const express = require('express')

const adminMiddleware = require('./lib/middleware/admin')
const admin = require('./lib/admin')
const db = require('./models/mongoDbLayer.js')
const sendEmail = require('./lib/email')

const adminRouter = express.Router()
const port = process.env.PORT || 3000

adminRouter.get('/login', (req, res) => {
    res.render('admin/login')
})

adminRouter.post('/login', (req, res) => {
    const checkAdmin = admin.validate(req.body.adminId, req.body.adminPw)

    switch (checkAdmin) {
        case 'Success':
            req.session.isAdmin = true
            res.locals.isAdmin = req.session.isAdmin
            res.redirect(303, '/')
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

adminRouter.post('/logout', (req, res) => {
    delete req.session.isAdmin
    const absoluteUserHomePath = `${req.protocol}://${req.hostname.replace('admin.', '')}:${port}`
    res.redirect(303, absoluteUserHomePath)
})

adminRouter.use(adminMiddleware.authorize)

adminRouter.get('/', async (req, res) => {
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

adminRouter.get('/read/:postId', async (req, res) => {
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
                id: comment._id.toString(),
                author: comment.author,
                comment: comment.comment,
            }
            return commentForView
        })
    }

    res.render('admin/read', context)
})

adminRouter.get('/write', (req, res) => {
    res.render('admin/write')
})

adminRouter.post('/write', async (req, res) => {
    const post = req.body

    await db.savePost(post)

    res.redirect(303, '/')
})

adminRouter.get('/update/:postId', async (req, res) => {
    const postId = req.params.postId

    const post = await db.getPost({ _id: postId })
    
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

adminRouter.post('/update/:postId', async (req, res) => {
    const postId = req.params.postId
    const updatedPost = req.body

    await db.updatePost({_id: postId}, updatedPost)
    
    res.redirect(303, `/read/${postId}`)
})

adminRouter.post('/delete', async (req, res) => {
    const postId = req.body.postId

    await db.deletePost({ _id: postId })
    await db.deleteComments({ post: postId })

    res.redirect(303, '/')
})

adminRouter.post('/read/:postId/deleteComment/:commentId', async (req, res) => {
    const postId = req.params.postId
    const commentId = req.params.commentId

    const post = await db.getPost({ _id: postId })
    const previousComment = db.getPreviousDeleteComment({ _id: commentId })

    const emailContext = {
        layout: null,  
        subject: post.title,
        state: '삭제',
        comment: previousComment.comment,
        url: 'http://' + req.hostname.replace('admin.', '') + ':' + port + `/read/${postId}`
    }

    res.render('email/emailTemplate', emailContext, (err, html) => {
        if (err) console.log(err)

        sendEmail(`${post.title}에 변동사항이 있습니다`, html)
        res.redirect(303, `/read/${postId}`)
    })
})

module.exports = adminRouter