const express = require('express')
const expressHandlebars = require('express-handlebars')

const handlers = require('./lib/errorHandlers')

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

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/write', (req, res) => {
    res.render('write')
})

app.get('/read', (req, res) => {
    const title = 'temp title'
    const author = 'temp author'
    const mainText = 'temp main text'

    res.render('read', {
        title: title,
        author: author,
        mainText: mainText
    })
})

app.get('/update', (req, res) => {
    const title = 'temp title'
    const author = 'temp author'
    const mainText = 'temp main text'
    
    res.render('update', {
        title: title,
        author: author,
        mainText: mainText
    })
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
