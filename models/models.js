const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    author: String,
    mainText: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    id: mongoose.Schema.Types.ObjectId,
})

const commentSchema = mongoose.Schema({
    author: String,
    comment: String,
    post: String,
    _id: mongoose.Schema.Types.ObjectId,
})

const Post = mongoose.model('Post', postSchema)
const Comment = mongoose.model('Comment', commentSchema)

module.exports = {
    Post,
    Comment
}