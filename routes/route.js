const express = require('express')
const router = express.Router()

const post = require('../handlers/post')
const comment = require('../handlers/comment')

router.get('/', post.getList)

router.get('/:postId', post.get)

router.post('/:postId/create-comment', comment.create)

router.get('/:postId/update-comment', comment.getUpdatePage)

router.post('/:postId/update-comment', comment.update)

router.post('/:postId/delete-comment', comment.delete)

module.exports = router