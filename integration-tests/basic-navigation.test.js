const puppeteer = require('puppeteer')
const portFinder = require('portfinder')

const app = require('../blog.js')

let port = null
let server = null

beforeEach(async () => {
    port = await portFinder.getPortPromise()
    server = app.listen(port)
})

afterEach(() => {
    server.close()
})

test('home page links to write page', async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(`http://localhost:${port}`)
    await Promise.all([
        page.waitForNavigation(),
        page.click('[data-test-id="write"]')
    ])

    expect(page.url()).toBe(`http://localhost:${port}/write`)
    await browser.close()
})