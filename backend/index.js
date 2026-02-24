const express = require('express')
const app = express()
const port = 3300

const cors = require('cors');
const fs = require('fs');
const path = require('path');
const search = require("./src/search");
const music = require("./src/music");
const users = require("./src/users");

const args = process.argv;

app.use(cors());

const baseDir = "home-music";
const musicDir = path.join(baseDir, "songs");
const userDir = path.join(baseDir, "users");
search(app, musicDir);
music(app, musicDir);
users(app, userDir, musicDir);

if (args.length > 2 && args[2] === "--host") {
    app.use(express.static(path.join(__dirname, "../dist")));

    app.get("/{*path}", (req, res) => {
        res.sendFile(path.join(__dirname, "../dist/index.html"));
    });
} else {
    console.log("Use option --host to also host the frontend");
}

app.listen(port, () => {
    if (!fs.existsSync(baseDir)) {
        console.log(`Base directory ${baseDir} does not exist, creating...`);
        fs.mkdirSync(baseDir);
    }
    console.log(`Home Music backend listening on port ${port}`)
})
