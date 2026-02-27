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
const os = require("os");

function getLocalIP() {
    const nets = os.networkInterfaces();

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === "IPv4" && !net.internal) {
                return net.address; // ← This is your LAN IP
            }
        }
    }
    return "0.0.0.0";
}

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
    console.log(`Home Music backend listening at ${getLocalIP()}:${port}`)
})
