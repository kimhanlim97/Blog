const handlers = require('../handlers')

test('home page render', () => {
    const req = {}
    const res = { render: jest.fn() }
    handlers.home(req, res)

    expect(res.render.mock.calls.length).toBe(1)
    expect(res.render.mock.calls[0][0]).toBe('home')
})

test('detail page render', () => {
    const req = {}
    const res = { render: jest.fn() }
    handlers.detail(req, res)

    expect(res.render.mock.calls.length).toBe(1)
    expect(res.render.mock.calls[0][0]).toBe('detail')
})

test('404 page render', () => {
    const req = {}
    const res = { render: jest.fn() }
    handlers.notFound(req, res)

    expect(res.render.mock.calls.length).toBe(1)
    expect(res.render.mock.calls[0][0]).toBe('404')
})

test('500 page render', () => {
    const err = new Error('test console error')
    const req = {}
    const res = { render: jest.fn() }
    const next = jest.fn()
    handlers.serverError(err, req, res, next)

    expect(res.render.mock.calls.length).toBe(1)
    expect(res.render.mock.calls[0][0]).toBe('500')
})