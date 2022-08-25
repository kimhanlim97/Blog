const express = require('express')
const adminRouter = express.Router()

const post = require('../handlers/post')
const comment = require('../handlers/comment')
const auth = require('../handlers/auth')


adminRouter.get('/login', auth.getLoginPage)

adminRouter.post('/login', auth.login)

adminRouter.post('/logout', auth.logout)

adminRouter.use(auth.check)

adminRouter.get('/', post.adminGetList)

adminRouter.get('/read/:postId', post.adminGet)

adminRouter.get('/write', post.getCreatePage)

adminRouter.post('/write', post.create)

adminRouter.get('/update/:postId', post.getUpdatePage)

adminRouter.post('/update/:postId', post.update)

adminRouter.post('/delete', post.delete)

adminRouter.post('/read/:postId/deleteComment/:commentId', comment.delete)

module.exports = adminRouter