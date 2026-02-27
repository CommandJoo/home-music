const express = require('express')
const app = express()
const port = 3300

const cors = require('cors');
const fs = require('fs');
const path = require('path');
const search = require("./src/search");
const music = require("./src/music");
const users = require("./src/users");
const QRCode = require('qrcode');

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

app.listen(port, async () => {
    const matrix = await QRCode.create(`http://${getLocalIP()}:${args.length <= 2 ? 5173 : port}`, {errorCorrectionLevel: 'M'});

    const size = matrix.modules.size;
    const outlineColor = "\u001b[43m"
    const outline = outlineColor + (" ".repeat((size + 2) * 2)) + "\u001b[49m";
    console.log(outline);
    for (let i = 0; i < size; i++) {
        let line = `${outlineColor}  `;
        for (let j = 0; j < size; j++) {
            line += matrix.modules.get(i, j) === 1 ? "\u001b[107m  " : "\u001b[49m  ";
        }
        console.log(line + `${outlineColor}  \u001b[49m`);
    }
    console.log(outline);
    console.log("\u001b[49m");
    if (!fs.existsSync(baseDir)) {
        console.log(`Base directory ${baseDir} does not exist, creating...`);
        fs.mkdirSync(baseDir);
    }
    console.log(`Home Music backend listening at ${getLocalIP()}:${args.length <= 2 ? 5173 : port}`)
})
