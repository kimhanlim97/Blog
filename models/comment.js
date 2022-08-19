const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
    author: String,
    comment: String,
    id: mongoose.Schema.Types.ObjectId,
    postId: {type: String, required: true}
})

module.exports = mongoose.model('Comment', commentSchema)