const fs = require("fs");
const path = require("path");

function setup(baseDir) {
    if (!fs.existsSync(baseDir)) {
        console.log(`Music directory ${baseDir} does not exist, creating...`);
        fs.mkdirSync(baseDir);
    }
}

function music(app, baseDir) {
    setup(baseDir);


    app.get("/api/songs", async (req, res) => {
        const songs = [];
        const artists = fs.readdirSync(baseDir);

        for (const artist of artists) {
            const artistDir = path.join(baseDir, artist);

            const artistMetaData = JSON.parse(fs.readFileSync(`${artistDir}/metadata.json`));

            const tracks = fs.readdirSync(artistDir);
            for (const track of tracks) {
                if (!fs.statSync(`${artistDir}/${track}`).isDirectory()) continue;
                const metaDataFile = `${baseDir}/${artist}/${track}/metadata.json`;
                let metaData = fs.existsSync(metaDataFile) ? (JSON.parse(fs.readFileSync(metaDataFile))) : {
                    duration: 0,
                    isrc: "0"
                };
                songs.push({
                    uuid: track,
                    title: metaData.track,
                    artist: {
                        id: artist,
                        name: artistMetaData.name,
                        picture: artistMetaData.picture,
                        path: `/api/songs/${artistDir}`
                    },
                    metadata: {
                        duration: metaData.duration,
                        isrc: metaData.isrc,
                    },
                    url: {
                        track: `/api/songs/${encodeURIComponent(artist)}/${encodeURIComponent(track)}/track`,
                        cover: `/api/songs/${encodeURIComponent(artist)}/${encodeURIComponent(track)}/cover`,
                    }
                });
            }
        }
        res.json(songs);
    })

    app.get("/api/artists", async (req, res) => {
        const artists = [];

        const dir = fs.readdirSync(baseDir);
        for (const artistDir of dir) {
            if (!fs.existsSync(`${baseDir}/${artistDir}/metadata.json`)) continue;
            const artistMetaData = JSON.parse(fs.readFileSync(`${baseDir}/${artistDir}/metadata.json`));
            // artistMetaData.id = artistDir;
            // fs.writeFileSync(`${baseDir}/${artistDir}/metadata.json`, JSON.stringify(artistMetaData));
            artists.push({
                id: artistMetaData.id,
                name: artistMetaData.name,
                picture: artistMetaData.picture,
                path: `/api/songs/${artistDir}`
            })
        }
        res.json(artists);
    })

    app.get('/api/songs/:artist/', (req, res) => {
        const songs = [];
        const artist = req.params.artist;
        const artistDir = path.join(baseDir, artist);

        const artistMetaData = JSON.parse(fs.readFileSync(`${artistDir}/metadata.json`));

        const tracks = fs.readdirSync(artistDir);
        for (const track of tracks) {
            if (!fs.statSync(`${artistDir}/${track}`).isDirectory()) continue;
            if (!fs.existsSync(`${artistDir}/metadata.json`)) return;
            const metaDataFile = `${baseDir}/${artist}/${track}/metadata.json`;
            let metaData = fs.existsSync(metaDataFile) ? (JSON.parse(fs.readFileSync(metaDataFile))) : {
                duration: 0,
                isrc: "0"
            };
            songs.push({
                title: metaData.track,
                artist: {
                    name: artistMetaData.name,
                    picture: artistMetaData.picture,
                    path: artist
                },
                metadata: {
                    duration: metaData.duration,
                    isrc: metaData.isrc,
                },
                url: {
                    track: `/api/songs/${encodeURIComponent(artist)}/${encodeURIComponent(track)}/track`,
                    cover: `/api/songs/${encodeURIComponent(artist)}/${encodeURIComponent(track)}/cover`,
                }
            });
        }
        res.json(songs);
    });
    app.get("/api/songs/:artist/:track", async (req, res) => {
        const artist = req.params.artist;
        const track = req.params.track;
        const artistDir = path.join(baseDir, artist);
        const songDir = path.join(artistDir, track);

        if (!fs.existsSync(`${artistDir}`)) {
            res.json({success: false, reason: "artist not found"});
            return;
        }
        const artistMetaData = JSON.parse(fs.readFileSync(`${artistDir}/metadata.json`));

        if (!fs.statSync(songDir).isDirectory()) {
            res.json({success: false, reason: "track not found"});
            return;
        }
        const metaDataFile = `${baseDir}/${artist}/${track}/metadata.json`;

        let metaData = JSON.parse(fs.readFileSync(metaDataFile));

        res.json({
            title: metaData.track,
            artist: {
                name: artistMetaData.name,
                picture: artistMetaData.picture,
                path: artist
            },
            metadata: {
                duration: metaData.duration,
                isrc: metaData.isrc,
            },
            url: {
                track: `/api/songs/${encodeURIComponent(artist)}/${encodeURIComponent(track)}/track`,
                cover: `/api/songs/${encodeURIComponent(artist)}/${encodeURIComponent(track)}/cover`,
            }
        });
    })

    app.get('/api/songs/:artist/:track/track', (req, res) => {
        const filePath = path.resolve(baseDir, req.params.artist, req.params.track, 'track.mp3');
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
        res.sendFile(filePath);
    });

    app.get('/api/songs/:artist/:track/cover', (req, res) => {
        const filePath = path.join(baseDir, req.params.artist, req.params.track, 'cover.png');
        res.sendFile(path.resolve(filePath));
    });
}

module.exports = music;