const express = require('express')
const router = express.Router()

const post = require('../handlers/post')
const comment = require('../handlers/comment')

router.get('/', post.getList)

router.get('/post/:postId', post.get)

router.post('/post/:postId/create-comment', comment.create)

router.get('/post/:postId/update-comment', comment.getUpdatePage)

router.post('/post/:postId/update-comment', comment.update)

router.post('/post/:postId/delete-comment', comment.delete)

module.exports = router