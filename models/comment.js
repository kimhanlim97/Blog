const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
    author: String,
    comment: String,
    post: String,
    _id: mongoose.Schema.Types.ObjectId,
})

module.exports = mongoose.model('Comment', commentSchema)