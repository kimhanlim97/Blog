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

        const categoryList = await db.getCategoryList()

        const context = {
            categoryList: categoryList
        }

        res.render('admin/write', context)
    },
    validateWrite: (req, res, next) => {
        const flash = { type: '', intro: '', message: '' }
        const { category, url } = req.body

        if (category === '') {
            flash.type = 'category validation fail'
            flash.intro = '카테고리가 비어있습니다'
            flash.message = '카테고리 값을 선택하거나 입력하세요'
            return res.json(flash)
        } else if (url === '') {
            flash.type = 'url validation fail'
            flash.intro = 'URL 설정이 비어있습니다'
            flash.message = 'URL을 입력하세요'
            return res.json(flash)
        } 
        next()
    },
    write: async (req, res, next) => {
        const post = req.body
        console.log(post)

        await db.savePost(post)

        res.redirect(303, `/post/${post.url}`)
    },
    validateCategory: async (req, res) => {
        const { newCategory } = req.body

        const isInCategory = await db.isInCategory(newCategory)

        if (isInCategory) return res.json({ categoryValidity: false })
        else return res.json({ categoryValidity: true })
    },
    validateURL: async (req, res) => {
        const { url } = req.body

        const isInURL = await db.isInURL(url)

        const URLValidity = {
            overlapValidity: false,
            stringValidity: true,
        }

        if (isInURL) URLValidity.overlapValidity = false
        else URLValidity.overlapValidity = true

        if (url === '') URLValidity.stringValidity = false
        else if (url.includes(' ')) URLValidity.stringValidity = false
        else if (url.length >= 200) URLValidity.stringValidity = false
        else URLValidity.stringValidity = true

        res.json(URLValidity)
    },
    delete: async (req, res) => {
        const postId = req.body.postId
    
        await db.deletePost({ _id: postId })
        await db.deleteComments({ post: postId })
    
        res.redirect(303, '/')
    }
}