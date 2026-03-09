const express = require('express')
const app = express()

const cors = require('cors');
const fs = require('fs');
const path = require('path');
const search = require("./src/rest/search");
const music = require("./src/rest/music");
const users = require("./src/rest/users");
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

if (!fs.existsSync("config.json")) {
    console.log("Error config does not exist");
}
const config = JSON.parse(fs.readFileSync("config.json"));
const port = config["port"] || 3300;

search(app, config, musicDir);
music(app, config, musicDir);
users(app, config, userDir, musicDir);

const defaultColor = {r: 220, g: 100, b: 0};
const color = (rgb) => {
    return `\u001b[38;2;${rgb.r};${rgb.g};${rgb.b}m`;
}
const background = (rgb) => {
    return `\u001b[48;2;${rgb.r};${rgb.g};${rgb.b}m`;
}
const reset = "\u001b[0m";

if (args.length > 2 && args[2] === "--host") {
    app.use(express.static(path.join(__dirname, "../dist")));

    app.get("/{*path}", (req, res) => {
        res.sendFile(path.join(__dirname, "../dist/index.html"));
    });
} else {
    console.log(`Use option ${color(defaultColor)}--host${reset} to also host the frontend`);
}

app.listen(port, async () => {
    const matrix = await QRCode.create(`http://${getLocalIP()}:${args.length <= 2 ? 5173 : port}`, {errorCorrectionLevel: 'H'});
    console.log("");
    const size = matrix.modules.size;
    const outlineColor = `${background(defaultColor)}`
    const outline = outlineColor + (" ".repeat((size + 2) * 2)) + reset;
    console.log(outline);
    for (let i = 0; i < size; i++) {
        let line = `${outlineColor}  `;
        for (let j = 0; j < size; j++) {
            line += matrix.modules.get(i, j) === 1 ? `${background(defaultColor)}  ` : `${reset}  `;
        }
        console.log(line + `${outlineColor}  ${reset}`);
    }
    console.log(outline);
    console.log("\u001b[49m");
    if (!fs.existsSync(baseDir)) {
        console.log(`Base directory ${baseDir} does not exist, creating...`);
        fs.mkdirSync(baseDir);
    }
    console.log(`Home Music backend listening at ${color(defaultColor)}${getLocalIP()}:${args.length <= 2 ? 5173 : port}`)
})
