const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    author: String,
    mainText: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    id: mongoose.Schema.Types.ObjectId,
})

module.exports = mongoose.model('Post', postSchema)