const fs = require('fs')

function getRandomId() {
    return Math.random().toString(36).substring(2, 11)
}

module.exports = {
    getRandomId,
    create: (newData) => {
        const id = getRandomId()
        newData.id = id

        fs.readFile(`./data/post.json`, 'utf8', (err, oldData) => {
            if (err) console.log(err)

            const data = JSON.parse(oldData)
            data[id] = newData

            fs.writeFile('./data/post.json', JSON.stringify(data), (err) => {
                if (err) console.log(err)
            })
        })

        return newData
    },
    read: (id = null) => {
        const data = JSON.parse(fs.readFileSync('./data/post.json', 'utf8'))
        
        if (id === null) return data
        else return data[id]
    },
    update: (id, updatedData) => {
        fs.readFile('./data/post.json', 'utf8', (err, oldData) => {
            if (err) console.log(err)

            const data = JSON.parse(oldData)
            updatedData.id = data[id].id
            data[id] = updatedData

            fs.writeFile('./data/post.json', JSON.stringify(data), (err) => {
                if (err) console.log(err)
            })
        })
    },
    delete: function(id) {
        fs.readFile('./data/post.json', 'utf8', (err, oldData) => {
            const data = JSON.parse(oldData)
            delete data[id]

            fs.writeFile('./data/post.json', JSON.stringify(data), (err) => {
                if (err) console.log(err)
            })
        })
    }
}