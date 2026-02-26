const fs = require("fs");
const path = require("path");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

function users(app, baseDir, musicDir) {
    function userDir(userId) {
        return path.join(baseDir, `accounts/${userId}`);
    }
    function userFile(userId) {
        return path.join(userDir(userId), `userdata.json`);
    }
    function toSafeFilename(str) {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9.\-_]/g, '_')  // replace anything unsafe with _
            .replace(/_+/g, '_')              // collapse multiple underscores
            .replace(/^_|_$/g, '');           // trim leading/trailing underscores
    }

    function readUsers() {
        if (!fs.existsSync(`${baseDir}/users.json`)) {
            return;
        }
        return JSON.parse(fs.readFileSync(`${baseDir}/users.json`));
    }
    function writeUsers(users) {
        return fs.writeFileSync(`${baseDir}/users.json`, JSON.stringify(users));
    }
    function readUser(userId) {
        const file = userFile(userId);
        if (!fs.existsSync(file)) {
            return {success: false, reason: "Account does not exist"};
        }

        return JSON.parse(fs.readFileSync(file));
    }
    function writeUser(userId, userData) {
        return fs.writeFileSync(userFile(userId), JSON.stringify(userData));
    }

    function readList(userId, listId) {
        const file = `${userDir(userId)}/playlists/${listId}`;
        if (!fs.existsSync(file)) {
            return;
        }
        return JSON.parse(fs.readFileSync(file));
    }


    function resolveTrackPath(musicDir, artist, song) {
        if(!fs.existsSync(musicDir)) {
            return "";
        }
        if(!fs.existsSync(`${musicDir}/${artist}`)) {
            return "";
        }
        if(!fs.existsSync(`${musicDir}/${artist}/${song}`)) {
            return "";
        }
        return `/api/songs/${artist}/${song}`;
    }

    function genPlaylistId() {
        const valid = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let id = "";
        for (let i = 0; i < 10; i++) {
            id += valid.charAt(Math.round(Math.random() * valid.length));
        }
        return id;
    }

    function setup(baseDir) {
        if (!fs.existsSync(baseDir)) {
            console.log(`User directory ${baseDir} does not exist, creating...`);
            fs.mkdirSync(baseDir, {recursive: true});
        }
        if (!fs.existsSync(`${baseDir}/users.json`)) {
            console.log(`User file ${baseDir} does not exist, creating...`);
            const users = {
                current_user: null,
                users: []
            }
            fs.writeFileSync(`${baseDir}/users.json`, JSON.stringify(users));
        }
        if (!fs.existsSync(`${baseDir}/accounts`)) {
            console.log(`Account directory ${baseDir}/accounts does not exist, creating...`);
            fs.mkdirSync(`${baseDir}/accounts`, {recursive: true});
        }
        const users = readUsers(baseDir);
        users.users.forEach((user) => {
            const userDir = `${baseDir}/accounts/${user.id}`;
            if (!fs.existsSync(userDir)) {
                console.log(`Account directory for ${user.id} does not exist, aborting...`);
                throw new Error(`Account directory for ${user.id} does not exist, even though user is registered`);
            }
            if (!fs.existsSync(`${userDir}/userdata.json`)) {
                throw new Error(`userdata.json for ${user.id} does not exist, even though user is registered`);
            }
        })
    }

    async function resolveRedirects(url, maxRedirects = 5) {
        if (maxRedirects === 0) return url;
        try {
            const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
            if (res.status === 301 || res.status === 302) {
                return resolveRedirects(res.headers.get('location'), maxRedirects - 1);
            }
        } catch (e) {}
        return url;
    }

    setup(baseDir);


    app.get("/api/users", async (req, res) => {
        res.json(readUsers(baseDir));
    });
    app.get("/api/users/default_cover", (req, res) => {
        res.sendFile(path.resolve(`${baseDir}/cover.png`));
    });
    app.post("/api/users/register", upload.single("image"), async (req, res) => {
        const name = req.query.name;
        const id = toSafeFilename(name);
        const path = `/api/users/${id}`;

        const directory = userDir(id);

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {recursive: true});

            const playlistDir = `${directory}/playlists`;
            if (!fs.existsSync(playlistDir)) {
                fs.mkdirSync(playlistDir, {recursive: true});
            }
            if (fs.existsSync(`${playlistDir}/liked_songs.json`)) {
                res.json({success: false, reason: "playlist id SOMEHOW already exists"});
                return;
            } else {
                const playlist = {cover: "/api/users/default_cover", title: "Liked Songs", content: []};
                fs.writeFileSync(`${playlistDir}/liked_songs.json`, JSON.stringify(playlist));
            }


            if (req.file) {
                fs.writeFileSync(`${directory}/picture.png`, req.file.buffer);
            }

            const pictureExists = fs.existsSync(`${directory}/picture.png`);

            const userdata = {
                name,
                picture: pictureExists ? `/api/users/${id}/picture` : "",
                radio: []
            }
            writeUser(id, userdata)


            const users = await readUsers(baseDir);
            users.current_user = id;
            users.users.push({id, path})
            writeUsers(users);

            res.json({success: true, id});
        } else {
            res.json({success: false, reason: "account directory already exists"});
        }

    });
    app.get("/api/users/switch", async (req, res) => {
        const user = req.query.id;
        if (!fs.existsSync(`${baseDir}/accounts/${user}`)) {
            res.json({success: false, reason: "account does not exist"});
            return;
        }
        const users = await readUsers(baseDir);
        users.current_user = user;
        writeUsers(users);

        res.json({success: true, user});
    })
    app.get("/api/users/:userId", async (req, res) => {
        const user = req.params.userId;
        const userdata = readUser(user);
        let playlists = [];
        if (fs.existsSync(`${baseDir}/accounts/${user}/playlists`)) {
            const lists = fs.readdirSync(`${baseDir}/accounts/${user}/playlists`);
            for (let list of lists) {
                const listData = {id: list.substring(0, list.indexOf(".json")), ...readList(user, list)};
                if (listData) playlists.push(listData);
            }
        }
        res.json({name: userdata.name, picture: userdata.picture, playlists, radio: userdata.radio});
    });
    app.get("/api/users/:userId/radio/follow", async (req, res) => {
        const user = req.params.userId;
        const station = req.query.uuid;
        const userdata = readUser(user);
        const radios = userdata.radio;

        const response = await fetch(`https://de1.api.radio-browser.info/json/stations/byuuid/${station}`)
        const result = (await response.json());
        const raw = result[0];
        const resolvedUrl = await resolveRedirects(raw.url_resolved);
        const data = {
            uuid: raw.stationuuid,
            title: raw.name,
            url: {
                track: resolvedUrl,
                cover: raw.favicon,
            },
            tags: raw.tags,
        }
        radios.push(data);

        userdata.radio = radios;
        writeUser(user, userdata);
        res.json({success: true, radios: radios});
    })
    app.get("/api/users/:userId/playlists/create", async (req, res) => {
        const user = req.params.userId;
        if (!fs.existsSync(`${userDir(user)}`)) {
            res.json({success: false, reason: "account does not exist"});
            return;
        }

        const title = req.query.title;
        const cover = "/api/users/default_cover";
        const content = [];

        const id = genPlaylistId();

        const playlistDir = `${userDir(user)}/playlists`;
        if (!fs.existsSync(playlistDir)) {
            fs.mkdirSync(playlistDir, {recursive: true});
        }
        if (fs.existsSync(path.join(playlistDir, `${id}.json`))) {
            res.json({success: false, reason: "playlist id SOMEHOW already exists"});
            return;
        }
        const playlist = {cover, title, content};
        fs.writeFileSync(`${playlistDir}/${id}.json`, JSON.stringify(playlist));

        res.json({success: true, id});
    });
    app.get("/api/users/:userId/playlists/:playlistId/add", async (req, res) => {
        const user = req.params.userId;
        if (!fs.existsSync(`${baseDir}/accounts/${user}`)) {
            res.json({success: false, reason: "account does not exist"});
            return;
        }
        const playlist = req.params.playlistId;
        if(!fs.existsSync(`${baseDir}/accounts/${user}/playlists/${playlist}.json`)) {
            res.json({success: false, reason: "playlist does not exist"});
            return;
        }
        const data = JSON.parse(fs.readFileSync(`${baseDir}/accounts/${user}/playlists/${playlist}.json`));

        const song = req.query.song;
        const artist = req.query.artist;

        const trackDir = resolveTrackPath(musicDir, artist, song);
        if(trackDir.length > 0) {
            data.content.push(
                trackDir
            )

        }
        fs.writeFileSync(`${baseDir}/accounts/${user}/playlists/${playlist}.json`, JSON.stringify(data));
        res.json(data);
    })
    app.get("/api/users/:userId/playlists/:playlistId", async (req, res) => {
        const user = req.params.userId;
        const playlist = req.params.playlistId;

        if (!fs.existsSync(`${baseDir}/accounts/${user}`)) {
            res.json({success: false, reason: "account does not exist"});
            return;
        }

        const playlistDir = `${baseDir}/accounts/${user}/playlists`;
        const playlistData = JSON.parse(fs.readFileSync(path.join(playlistDir, playlist+".json")));
        res.json({
            id: playlist,
            title: playlistData.title,
            cover: playlistData.cover,
            content: playlistData.content
        });
    })
    app.get("/api/users/:userId/picture", async (req, res) => {
        const user = req.params.userId;
        const userdata = readUser(user);
        if(userdata.picture && fs.existsSync(path.join(userDir(user), "picture.png"))) {
            res.sendFile(path.resolve(path.join(userDir(user), "picture.png")));
        }
    });
}

module.exports = users;