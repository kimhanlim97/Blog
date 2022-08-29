const https = require('https')
const fs = require('fs')
const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const vhost = require('vhost')
const csrf = require('csurf')

const flashMiddleware = require('./middleware/flash')
const csrfMiddleware = require('./middleware/csrf')
const router = require('./routes/route')
const adminRouter = require('./routes/admin.route')

const app = express()

// static middleware
app.use('/static', express.static('public'))

// handlebars view engine
app.engine('.hbs', expressHandlebars.engine({
    defaultlayout: 'main',
    extname: '.hbs',
}))
app.set('view engine', '.hbs')

// body-parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: 'secret',
}))
app.use(csrf({cookie: true}))

app.use(flashMiddleware)
app.use(csrfMiddleware)

app.use(vhost('admin.blog.local', adminRouter))
app.use(router)

// custom 404, 500 page
app.use((req, res) => res.render('error/404'))

/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
    console.log(err)
    res.render('error/500')
})
/* eslint-disable no-unused-vars */
const options = {
    key: fs.readFileSync(__dirname + '/ssl/blog.pem'),
    cert: fs.readFileSync(__dirname + '/ssl/blog.crt')
}

const port = process.env.PORT || 3000
// https.createServer(options, app).listen(port, () => {
//     console.log(`Express start on port ${port}`)
// })

app.listen(port, () => {
    console.log(`Express start on ${port}`)
})
