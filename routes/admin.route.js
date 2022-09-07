const express = require('express')
const adminRouter = express.Router()

const post = require('../handlers/post')
const comment = require('../handlers/comment')
const auth = require('../handlers/auth')

adminRouter.get('/login', auth.getLoginPage)

adminRouter.post('/login', auth.adminAuthN)

adminRouter.post('/logout', auth.logout)

// adminRouter.use(auth.adminAuthZ)

adminRouter.get('/', post.getList)

adminRouter.get('/write', post.getWritePage)

adminRouter.post('/write/check-category', post.validateCategory)

adminRouter.post('/write/check-url', post.validateURL)

adminRouter.post('/write', post.validateWrite, post.write)

adminRouter.post('/post/delete', post.delete)

adminRouter.get('/post/:postId', post.get)

adminRouter.post('/post/:postId/delete-comment', comment.delete)

module.exports = adminRouter