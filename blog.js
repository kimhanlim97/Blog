const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')

const handlers = require('./lib/errorHandlers')
const postDataController = require('./lib/postDataControl')

const app = express()
const port = process.env.PORT || 3000

// static middleware
app.use(express.static(__dirname + '/public'))

// handlebars view engine
app.engine('.hbs', expressHandlebars.engine({
    defaultlayout: 'main',
    extname: '.hbs'
}))
app.set('view engine', '.hbs')

// body-parser
app.use(bodyParser.urlencoded({extended: true}))

// general route
app.get('/', (req, res) => {
    const arrangedPosts = postDataController.readDataList()

    res.render('home', {
        posts: arrangedPosts
    })
})

app.get('/:identifier', (req, res) => {
    const selectedPost = postDataController.readData(req.params.identifier)

    res.render('read', {
        post: selectedPost
    })
})

// admin route
app.get('/admin/write', (req, res) => {
    res.render('write')
})

app.post('/admin/write', (req, res) => {
    // postDataController.saveData는 폼 전송된 정보를 data/post.json에 저장한 뒤 생성한 identifier를 리턴함
    const newPostIdentifier = postDataController.saveData(req.body)
    res.redirect(303, `/${newPostIdentifier}`)
})

app.get('/admin/update/:identifier', (req, res) => {
    const selectedPost = postDataController.updateDataRendering(req.params.identifier)
    
    res.render('update', {
        post: selectedPost
    })
})

app.post('/admin/update/:identifier', (req, res) => {
    postDataController.updateData(req.params.identifier, req.body)
    
    res.redirect(303, `/${req.params.identifier}`)
})

app.post('/admin/delete', (req, res) => {
    postDataController.deleteData(req.body.identifier)

    res.redirect(303, '/')
})

// custom 404 page
app.use(handlers.notFound)

// custom 500 page
app.use(handlers.serverError)

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Express start on http://localhost:${port}`)
    })
} else {
    module.exports = app
}
