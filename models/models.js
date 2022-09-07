const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    category: String
})

const postSchema = mongoose.Schema({
    // new Schema
    id: mongoose.Schema.Types.ObjectId,
    category: String,
    url: {type: String, required: true, unique: true},
    main: Object,
    // old Schema
    title: { type: String },
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

module.exports = {
    Category,
    Post,
    Comment,
    User
}