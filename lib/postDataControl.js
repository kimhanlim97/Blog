const fs = require('fs')

function getRandomIdentifier() {
    return Math.random().toString(36).substring(2, 11)
}

module.exports = {
    readDataList: function() {
        const objectifiedPosts = JSON.parse(fs.readFileSync('./data/post.json', 'utf8'))
        const arrangedPosts = Object.keys(objectifiedPosts).map(identifier => objectifiedPosts[identifier])

        return arrangedPosts
    },
    readData: function(identifier) {
        const posts = JSON.parse(fs.readFileSync('./data/post.json', 'utf8'))
        const selectedPost = posts[identifier]

        return selectedPost
    },
    saveData: function(newPost) {
        const newPostIdentifier = getRandomIdentifier()
        newPost.identifier = newPostIdentifier

        fs.readFile('./data/post.json', 'utf8', (err, oldPosts) => {
            if (err) console.log(err)

            const posts = JSON.parse(oldPosts)
            posts[newPostIdentifier] = newPost

            fs.writeFile('./data/post.json', JSON.stringify(posts), (err) => {
                if (err) console.log(err)
            })
        })
        return newPostIdentifier
    },
    updateDataRendering: function(identifier) {
        const posts = JSON.parse(fs.readFileSync('./data/post.json', 'utf8'))
        const selectedPost = posts[identifier]

        return selectedPost
    },
    updateData: function(identifier, updatedPost) {
        updatedPost.identifier = identifier

        fs.readFile('./data/post.json', 'utf8', (err, oldPosts) => {
            if (err) console.log(err)
            const posts = JSON.parse(oldPosts)
            posts[identifier] = updatedPost

            fs.writeFile('./data/post.json', JSON.stringify(posts), (err) => {
                if (err) console.log(err)
            })
        })
    },
    deleteData: function(identifier) {
        fs.readFile('./data/post.json', 'utf8', (err, oldPosts) => {
            const posts = JSON.parse(oldPosts)
            delete posts[identifier]

            fs.writeFile('./data/post.json', JSON.stringify(posts), (err) => {
                if (err) console.log(err)
            })
        })
    }
}