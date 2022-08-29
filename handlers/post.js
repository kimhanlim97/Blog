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
        
        if (req.hostname.includes('admin')) res.render('admin/home', context)
        else res.render('user/home', context)
    },
    get: async (req, res, next) => {
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

        if (req.hostname.includes('admin')) res.render('admin/read', context)
        else res.render('user/read', context)
    },
    getWritePage: async (req, res) => {
        const postId = req.query.id

        if (postId) {
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
        }

        res.render('admin/write')
    },
    write: async (req, res) => {
        const postId = req.query.id
        const post = req.body

        if (postId) {
            await db.updatePost({_id: postId}, post)
            
            res.redirect(303, `/post/${postId}`)
        }else {
            await db.savePost(post)
    
            res.redirect(303, '/')
        }
    },
    delete: async (req, res) => {
        const postId = req.body.postId
    
        await db.deletePost({ _id: postId })
        await db.deleteComments({ post: postId })
    
        res.redirect(303, '/')
    }
}