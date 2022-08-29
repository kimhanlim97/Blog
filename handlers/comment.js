const nodemailer = require('nodemailer')
const nodemailerSG = require('nodemailer-sendgrid')
const htmlToFormattedText = require('html-to-formatted-text')
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
const db = require('../models/mongoDbLayer')

const port = process.env.PORT || 3000

function sendEmail(subject, html) {

    const transport = nodemailer.createTransport(
        nodemailerSG({
            apiKey: credentials.sendgridAPI
        })
    )

    return transport.sendMail({
        from: 'kimhanlim97@gmail.com',
        to: 'kimhanlim97@gmail.com',
        subject: subject,
        html: html,
        text: htmlToFormattedText(html)
    }).catch(err => {
        console.log(err.message)
    })
}

module.exports = {
    create: async(req, res) => {
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
            url: 'http://' + req.hostname + ':' + port + `/${postId}` 
        }
    
        res.render('email/emailTemplate', emailContext, (err, html) => {
            if (err) console.log(err)
            
            sendEmail(`${post.title}에 변동사항이 있습니다`, html)
    
            res.redirect(303, `/post/${postId}`)
        })
    },
    getUpdatePage: async (req, res) => {
        const postId = req.params.postId
        const updateCommentId = req.query.id
    
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
    },
    update: async(req, res) => {
        const postId = req.params.postId
        const commentId = req.query.id
        const updatedComment = req.body
    
        const post = await db.getPost({ _id: postId })
        const previousComment = await db.getPreviousUpdateComment({ _id: commentId }, updatedComment)
    
        const emailContext = {
            layout: null,  
            subject: post.title,
            state: '수정',
            comment: previousComment.comment,
            updatedComment: updatedComment.comment,
            url: 'http://' + req.hostname + ':' + port + `/${postId}`
        }
    
        res.render('email/emailTemplate', emailContext, (err, html) => {
            if (err) console.log(err)
            
            sendEmail(`${post.title}에 변동사항이 있습니다`, html)
            res.redirect(303, `/post/${postId}`)
        })
    },
    delete: async (req, res) => {
        const postId = req.params.postId
        const commentId = req.query.id
    
        const post = await db.getPost({ _id: postId })
        const previousComment = db.getPreviousDeleteComment({ _id: commentId })
    
        const emailContext = {
            layout: null,  
            subject: post.title,
            state: '삭제',
            comment: previousComment.comment,
            url: 'http://' + req.hostname + ':' + port + `/${req.params.postId}`
        }
    
        res.render('email/emailTemplate', emailContext, (err, html) => {
            if (err) console.log(err)
    
            sendEmail(`${post.title}에 변동사항이 있습니다`, html)
            res.redirect(303, `/post/${postId}`)
        })
    }
}