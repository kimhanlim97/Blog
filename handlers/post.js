const db = require('../models/mongoDbLayer')

module.exports = {
    getList: async (req, res) => {
        const postList = await db.getPostList()
    
        const context = {
            postList: postList.map(post => {
                const postForView = {
                    id: post._id,
                    title: post.title
                }
                return postForView
            })
        }
    
        res.render('user/home', context)
    },
    get: async (req, res) => {
        const postId = req.params.postId
    
        const post = await db.getPost({ _id: postId })
        const comments = post.comments
        
        const context = {
            post: {
                id: post._id,
                title: post.title,
                author: post.author,
                mainText: post.mainText,
            },
            comments: comments.map(comment => {
                const commentForView = {
                    id: comment._id.toString(),
                    author: comment.author,
                    comment: comment.comment,
                }
                return commentForView
            })
        }
    
        res.render('user/read', context)
    },
    adminGetList: async (req, res) => {
        const postList = await db.getPostList()
    
        const context = {
            postList: postList.map(post => {
                const postForView = {
                    id: post._id,
                    title: post.title
                }
                return postForView
            })
        }
    
        res.render('admin/home', context)
    },
    adminGet: async (req, res) => {
        const postId = req.params.postId
    
        const post = await db.getPost({ _id: postId })
        const comments = post.comments
        
        const context = {
            post: {
                id: post._id,
                title: post.title,
                author: post.author,
                mainText: post.mainText,
            },
            comments: comments.map(comment => {
                const commentForView = {
                    id: comment._id.toString(),
                    author: comment.author,
                    comment: comment.comment,
                }
                return commentForView
            })
        }
    
        res.render('admin/read', context)
    },
    getCreatePage: (req, res) => {
        res.render('admin/write')
    },
    create: async (req, res) => {
        const post = req.body
    
        await db.savePost(post)
    
        res.redirect(303, '/')
    },
    getUpdatePage: async (req, res) => {
        const postId = req.params.postId
    
        const post = await db.getPost({ _id: postId })
        
        const context = {
            post: {
                id: post._id,
                title: post.title,
                author: post.author,
                mainText: post.mainText
            }
        }
    
        res.render('admin/update', context)
    },
    update: async (req, res) => {
        const postId = req.params.postId
        const updatedPost = req.body
    
        await db.updatePost({_id: postId}, updatedPost)
        
        res.redirect(303, `/read/${postId}`)
    },
    delete: async (req, res) => {
        const postId = req.body.postId
    
        await db.deletePost({ _id: postId })
        await db.deleteComments({ post: postId })
    
        res.redirect(303, '/')
    }
}