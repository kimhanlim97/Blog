const express = require('express')
const expressHandlebars = require('express-handlebars')

const handlers = require('./lib/handlers')

const app = express()
const port = process.env.PORT || 3000

// static middleware
app.use(express.static(__dirname + '/public'))

// handlebars view engine
app.engine('handlebars', expressHandlebars.engine({
    defaultlayout: 'main'
}))
app.set('view engine', 'handlebars')

app.get('/', handlers.home)

app.get('/detail', handlers.detail)

// custom 404 page
app.use(handlers.notFound)

// custom 500 page
app.use(handlers.serverError)

app.listen(port, () => {
    console.log(`Express start on http://localhost:${port}`)
})