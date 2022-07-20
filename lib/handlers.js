exports.home = (req, res) => res.render('home')

exports.detail = (req, res) => res.render('detail')

exports.notFound = (req, res) => res.render('404')

exports.serverError = (err, req, res, next) => {
    console.log(err)
    res.render('500')
}