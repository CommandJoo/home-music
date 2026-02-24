const mp3Duration = require("mp3-duration");

const fs = require('fs');
const ytDlp = require("yt-dlp-exec");
const net = require('net');

const apiKey = "AIzaSyD2fxT9NeLHVlrOHnEd1nr5QyfLDybWois";


function icyConnect(streamUrl, onMetadata, onError) {
    const parsed = new URL(streamUrl);
    const host = parsed.hostname;
    const port = parsed.port || 80;
    const path = parsed.pathname + parsed.search;

    const socket = net.createConnection(port, host, () => {
        socket.write(
            `GET ${path} HTTP/1.0\r\n` +
            `Host: ${host}\r\n` +
            `Icy-Metadata: 1\r\n` +
            `Connection: close\r\n` +
            `\r\n`
        );
    });

    let metaint = null;
    let headersParsed = false;
    let buffer = Buffer.alloc(0);
    let bytesUntilMeta = null;

    socket.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);

        if (!headersParsed) {
            let headerEnd = -1;
            let headerSkip = 2;

            const rn = buffer.indexOf(Buffer.from([0x0d, 0x0a, 0x0d, 0x0a])); // \r\n\r\n
            const n  = buffer.indexOf(Buffer.from([0x0a, 0x0a]));              // \n\n

            if (rn !== -1) { headerEnd = rn; headerSkip = 4; }
            else if (n !== -1) { headerEnd = n; headerSkip = 2; }

            if (headerEnd === -1) return;

            const headers = buffer.slice(0, headerEnd).toString('utf8');
            buffer = buffer.slice(headerEnd + headerSkip);
            headersParsed = true;

            const metaintMatch = headers.match(/icy-metaint:\s*(\d+)/i);
            if (metaintMatch) {
                metaint = parseInt(metaintMatch[1]);
                bytesUntilMeta = metaint;
            } else {
                console.log(`${streamUrl} does not support icy`)
            }
        }

        if (metaint === null) return;

        while (buffer.length > 0) {
            if (bytesUntilMeta > 0) {
                const consume = Math.min(bytesUntilMeta, buffer.length);
                bytesUntilMeta -= consume;
                buffer = buffer.slice(consume);
            } else {
                // next byte is metadata length
                if (buffer.length < 1) break;
                const metaLen = buffer[0] * 16;
                buffer = buffer.slice(1);

                if (metaLen === 0) {
                    bytesUntilMeta = metaint;
                    continue;
                }

                if (buffer.length < metaLen) break;
                const metaBlock = buffer.slice(0, metaLen).toString('utf8').replace(/\0/g, '');
                buffer = buffer.slice(metaLen);
                bytesUntilMeta = metaint;

                const match = metaBlock.match(/StreamTitle='([^']*)'/);
                if (match) onMetadata(match[1]);
            }
        }
    });

    socket.on('error', onError);
    return socket;
}

function toSafeFilename(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9.\-_]/g, '_')  // replace anything unsafe with _
        .replace(/_+/g, '_')              // collapse multiple underscores
        .replace(/^_|_$/g, '');           // trim leading/trailing underscores
}

function setup(baseDir) {
    if (!fs.existsSync(baseDir)) {
        console.log(`Music directory ${baseDir} does not exist, creating...`);
        fs.mkdirSync(baseDir);
    }
}

async function deezerToMusic(response) {
    return (await response.json()).data.map((complex) => {
        return {
            title: complex.title,
            isrc: complex.isrc,
            cover: `https://e-cdns-images.dzcdn.net/images/cover/${complex.md5_image}/512x512.jpg`,
            artist: {
                name: complex.artist.name,
                picture: complex.artist.picture_big,
            }
        }
    });
}

async function radioReformed(response) {
    const data = await response.json();
    return Promise.all(data.map(async (complex) => {
        return {
            uuid: complex.stationuuid,
            title: complex.name,
            url: {
                track: complex.url_resolved,
                cover: complex.favicon,
            },
            tags: complex.tags,
        };
    }));
}

function search(app, baseDir) {
    setup(baseDir);


    app.get("/api/search", async (req, res) => {
        const q = req.query.q;
        const response = await fetch(
            `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=20`
        );
        console.log(`Searching https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=20`)
        res.json(await deezerToMusic(response));
    });

    app.get("/api/radio", async (req, res) => {
        const q = req.query.name;
        const response = await fetch(`https://all.api.radio-browser.info/json/stations/search?name=${q}`);
        console.log(`Searching radio browser for ${q}`);
        res.json(await radioReformed(response));
    })

    app.get('/api/radio/nowplaying', (req, res) => {
        const streamUrl = req.query.url;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const socket = icyConnect(
            streamUrl,
            (title) => {
                res.write(`data: ${JSON.stringify({ title })}\n\n`);
            },
            (err) => console.error('ICY error:', err)
        );

        req.on('close', () => socket.destroy());
    });

    app.post("/api/download", async (req, res) => {
        const track = req.query.track;
        const artist = req.query.artist;
        const cover = req.query.cover;
        const isrc = req.query.isrc;
        const artist_picture = decodeURIComponent(atob(req.query.artist_picture));

        function searchYoutube(track, artist) {
            const url =
                "https://www.googleapis.com/youtube/v3/search" +
                "?part=snippet" +
                "&maxResults=20" +
                "&videoCategoryId=10" +
                "&type=video" +
                "&q=" + encodeURIComponent(artist + " " + track) +
                "&key=" + apiKey;

            async function load() {
                function normalize(s) {
                    return s.toLowerCase().trim();
                }

                function scoreResult(item, track, artist) {
                    const title = normalize(item.snippet.title);
                    const channel = normalize(item.snippet.channelTitle);
                    const t = normalize(track);
                    const a = normalize(artist);

                    let score = 0;

                    if (title.includes(t)) score += 5;
                    if (title.includes(a)) score += 5;

                    if (channel.includes(a)) score += 10;

                    if (channel.includes("vevo")) score += 6;

                    if (channel.includes("topic")) score += 4;

                    const bad = ["cover", "karaoke", "live", "reaction"];
                    for (const b of bad) {
                        if (title.includes(b) && !track.includes(b)) score -= 6;
                    }

                    return score;
                }


                const resp = await fetch(url);
                const response = await resp.json();
                const items = response.items;

                if (items && items.length > 0) {
                    let best = null;
                    let bestScore = -Infinity;

                    for (const item of items) {
                        const s = scoreResult(item, track, artist);
                        if (s > bestScore) {
                            bestScore = s;
                            best = item;
                        }
                    }
                    console.log(`Found \"${track}\" by ${artist}  https://www.youtube.com/watch?v=${best.id.videoId}`)
                    return best;
                } else {
                    return null;
                }
            }

            return load();
        }

        const result = await searchYoutube(artist, track)
        res.json({success: true});
        await downloadVideo(artist, track, cover, isrc, artist_picture, `https://www.youtube.com/watch?v=${result.id.videoId}`);
    })

    async function downloadVideo(artist, track, cover, isrc, artist_picture, url) {
        console.log("-".repeat(20));
        console.log("Trying to download " + track);
        const artistDir = `${baseDir}/${toSafeFilename(artist)}`
        const songDir = `${artistDir}/${toSafeFilename(track)}`;

        if (!fs.existsSync(artistDir)) {
            fs.mkdirSync(artistDir, {recursive: true});
            console.log(`[1/6] Artist directory not found, creating...`);
        } else {
            console.log(`[1/6] Artist directory found, skipped...`);
        }
        if (!fs.existsSync(`${artistDir}/metadata.json`)) {
            const metaData = {
                id: toSafeFilename(artist),
                name: artist,
                picture: artist_picture,
            }
            fs.writeFileSync(`${artistDir}/metadata.json`, JSON.stringify(metaData));
            console.log(`[2/6] Artist metadata not found, creating...`);
        } else {
            console.log(`[2/6] Artist metadata found, skipped...`);
        }
        if (!fs.existsSync(songDir)) {
            fs.mkdirSync(songDir, {recursive: true});
            console.log(`[3/6] Song directory not found, creating...`);
        }else {
            console.log(`[3/6] Song directory found, skipped...`);
        }

        if (!fs.existsSync(songDir + '/track.mp3')) {
            console.log(`[4/6] Track not found, downloading...`);
            await ytDlp(url, {
                extractAudio: true,
                audioFormat: 'mp3',
                output: `${songDir}/track.mp3`,
            });
        } else {
            console.log(`[4/6] Track already present, skipped...`);
        }

        if(!fs.existsSync(`${songDir}/cover.jpg`)) {
            const coverResponse = await fetch(cover);
            const buffer = await coverResponse.arrayBuffer();
            fs.writeFileSync(`${songDir}/cover.png`, Buffer.from(buffer));
            console.log(`[5/6] Cover not found, downloading...`);
        }else {
            console.log(`[5/6] Cover already present, skipped...`);
        }

        if(!fs.existsSync(`${songDir}/metadata.json`)) {
            async function writeMetaData() {
                let duration = 0;
                await mp3Duration(`${songDir}/track.mp3`, (err, dur) => {
                    duration = dur;
                });
                const metaData = {
                    duration,
                    isrc,
                    track,
                    artist,
                }
                fs.writeFileSync(`${songDir}/metadata.json`, JSON.stringify(metaData));
            }

            console.log(`[6/6] Song Metadata not found, creating...`);
            await writeMetaData();
        }else {
            console.log(`[6/6] Song Metadata already present, skipped...`);
        }

        console.log("Finished downloading " + track);
        console.log("-".repeat(20));
    }
}

module.exports = search;