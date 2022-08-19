const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const Post = require('./models/post')
const Comment = require('./models/comment')

let credentials
if (fs.existsSync(path.resolve(__dirname, './', 'credentials.js'))) {
    credentials = require('./credentials')
}
else {
    credentials = require('./credentials~')
}

if (!credentials.mongo) {
    console.error('인증키를 credentials 파일에 등록하십시오')
    process.exit(1)
}

mongoose.connect(credentials.mongo.connectionString)

const db = mongoose.connection

db.on('error', err => {
    console.error('MongoDB Error: ' + err.message)
    process.exit(1)
})
db.once('open', () => console.log('MongoDB connection established'))

module.exports = {
    getPostList: async (options = {}) => Post.find(options),
    getPost: async (options = {}) => Post.findOne(options),
    savePost: async (data) => {
        const newPost = new Post({
            title: data.title,
            author: data.author,
            mainText: data.mainText
        }).save()
    },
    updatePost: async (options = {}, update = {}) => Post.updateOne(options, update),
    deletePost: async (options = {}) => Post.deleteOne(options),
    getCommentList: async (options = {}) => Comment.find(options),
    saveComment: async (data, postId) => {
        const newComment = new Comment({
            author: data.author,
            comment: data.comment,
            postId: postId
        }).save()
    },
    getPreviousUpdateComment: async (options = {}, update = {}) => {
        const previousComment = await Comment.findOne(options)
        await Comment.updateOne(options, update)

        return previousComment
    },
    getPreviousDeleteComment: async (options = {}) => {
        const previousComment = await Comment.findOne(options)
        await Comment.deleteOne(options)

        return previousComment
    }
}