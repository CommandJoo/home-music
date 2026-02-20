const express = require('express')
const app = express()
const port = 3300

const cors = require('cors');
const fs = require('fs');
const paths = require('path');
const search = require("./src/search");
const music = require("./src/music");
const users = require("./src/users");

app.use(cors());

const baseDir = "home-music";
const musicDir = paths.join(baseDir, "songs");
const userDir = paths.join(baseDir, "users");

search(app, musicDir);
music(app, musicDir);
users(app, userDir, musicDir);


app.listen(port, () => {
    if (!fs.existsSync(baseDir)) {
        console.log(`Base directory ${baseDir} does not exist, creating...`);
        fs.mkdirSync(baseDir);
    }
    console.log(`Home Music backend listening on port ${port}`)
})
