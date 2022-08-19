const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    author: String,
    mainText: String,
    id: mongoose.Schema.Types.ObjectId,
})

module.exports = mongoose.model('Post', postSchema)