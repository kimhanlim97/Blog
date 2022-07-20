const express = require('express')
const expressHandlebars = require('express-handlebars')

const app = express()
const port = process.env.PORT || 3000

// static middleware
app.use(express.static(__dirname + '/public'))

// handlebars view engine
app.engine('handlebars', expressHandlebars.engine({
    defaultlayout: 'main'
}))
app.set('view engine', 'handlebars')


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/detail', (req, res) => {
    res.render('detail')
})

// custom 404 page
app.use((req, res) => {
    res.type('text/plain')
    res.status(404)
    res.send('404 - Not Found')
})

// custom 500 page
app.use((err, req, res, next) => {
    console.error(err.message)
    res.type('text/plain')
    res.status(500)
    res.send('500 - Server Error')
})

app.listen(port, () => {
    console.log(`Express start on http://localhost:${port}`)
})