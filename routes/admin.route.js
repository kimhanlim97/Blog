const express = require('express')
const adminRouter = express.Router()

const post = require('../handlers/post')
const comment = require('../handlers/comment')
const auth = require('../handlers/auth')


adminRouter.get('/login', auth.getLoginPage)

adminRouter.post('/login', auth.login)

adminRouter.post('/logout', auth.logout)

adminRouter.use(auth.check)

adminRouter.get('/', post.getList)

adminRouter.get('/write', post.getWritePage)

adminRouter.post('/write', post.write)

adminRouter.post('/delete', post.delete)

adminRouter.get('/:postId', post.get)

adminRouter.post('/:postId/delete-comment', comment.delete)

module.exports = adminRouter