module.exports = (req, res, next) => {
    res.locals._csrfToken = req.csrfToken()
    next()
}