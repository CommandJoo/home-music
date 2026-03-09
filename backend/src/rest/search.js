const fs = require('fs');
const {radioData} = require("../util/music_util");
const {normalizedSearchResult, normalizedRadio, searchYoutube, downloadVideo} = require("../util/util");

function setup(baseDir) {
    if (!fs.existsSync(baseDir)) {
        console.log(`Music directory ${baseDir} does not exist, creating...`);
        fs.mkdirSync(baseDir);
    }
}

function search(app, config, baseDir) {
    setup(baseDir);

    /**
     * Search for songs on Deezer
     * ?q -> Search Query (Song title + artist)
     **/
    app.get("/api/song", async (req, res) => {
        const q = req.query.q;
        const response = await fetch(
            `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=20`
        );
        console.log(`Searching https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=20`)
        res.json(await normalizedSearchResult(response));
    });

    /**
     * Search for radio stations on radio-browser
     * ?q -> Search Query (Station name)
     **/
    app.get("/api/radio", async (req, res) => {
        const q = req.query.q;
        const response = await fetch(`https://all.api.radio-browser.info/json/stations/search?name=${q}`);
        console.log(`Searching radio browser for ${q}`);
        res.json(await normalizedRadio(response));
    })

    /**
     * Get Now playing data from radio stream icy metadata
     * ?url -> stream url
     **/
    app.get('/api/radio/now_playing', (req, res) => {
        const streamUrl = req.query.url;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const socket = radioData(
            streamUrl,
            (title) => {
                res.write(`data: ${JSON.stringify({ title })}\n\n`);
            },
            (err) => console.error('ICY error:', err)
        );

        req.on('close', () => socket.destroy());
    });

    /**
     * Downloads a song from Youtube
     * ?track -> track name
     * ?artist -> artist name
     * ?cover -> cover url
     * ?isrc
     * ?artist_picture -> artist picture url
     **/
    app.post("/api/download", async (req, res) => {
        const track = req.query.track;
        const artist = req.query.artist;
        const cover = req.query.cover;
        const isrc = req.query.isrc;
        const artist_picture = decodeURIComponent(atob(req.query.artist_picture));

        const result = await searchYoutube(artist, track, config)
        try {
            await downloadVideo(baseDir, artist, track, cover, isrc, artist_picture, `https://www.youtube.com/watch?v=${result.id.videoId}`);
            res.json({success: true});
        } catch (e) {
            console.error("Download failed:", e);
            res.json({success: false});
        }
    });
}

module.exports = search;