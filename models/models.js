const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    category:  String,
})

const postSchema = mongoose.Schema({
    // new Schema
    id: mongoose.Schema.Types.ObjectId,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    url: {type: String, unique: true},
    main: Object,
    // old Schema
    title: {type: String, required: true},
    author: String,
    mainText: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
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

const Category = mongoose.model('Category', categorySchema)
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
    Category,
    Post,
    Comment,
    User
}