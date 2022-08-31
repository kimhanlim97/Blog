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

const userSchema = mongoose.Schema({
    authorId: String,
    id: String,
    password: String,
    role: String,
    name: String
})

const Post = mongoose.model('Post', postSchema)
const Comment = mongoose.model('Comment', commentSchema)
const User = mongoose.model('User', userSchema)

// new User({
//     authorId: 'admin: rlagksfla123',
//     password: 'khlm8107',
//     role: 'admin',
//     name: '글쓴이'
// }).save()

module.exports = {
    Post,
    Comment,
    User
}