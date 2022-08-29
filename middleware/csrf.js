module.exports = (req, res, next) => {
    res.locals._csrfToken = req.csrfToken()
    console.log(res.locals._csrfToken)
    next()
}