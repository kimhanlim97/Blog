const express = require('express')
const router = express.Router()

const post = require('../handlers/post')
const comment = require('../handlers/comment')

router.get('/', post.getList)

router.get('/read/:postId', post.get)

router.post('/read/:postId/createComment', comment.create)

router.get('/read/:postId/updateComment/:commentId', comment.getUpdatePage)

router.post('/read/:postId/updateComment/:commentId', comment.update)

router.post('/read/:postId/deleteComment/:commentId', comment.delete)

module.exports = router