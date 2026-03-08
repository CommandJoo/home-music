const fs = require('fs');
const ytDlp = require("yt-dlp-exec");
const mp3Duration = require("mp3-duration");

function toSafeFilename(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9.\-_]/g, '_')  // replace anything unsafe with _
        .replace(/_+/g, '_')              // collapse multiple underscores
        .replace(/^_|_$/g, '');           // trim leading/trailing underscores
}


function resolveTrackPath(musicDir, artist, song) {
    if (!fs.existsSync(musicDir)) {
        return "";
    }
    if (!fs.existsSync(`${musicDir}/${artist}`)) {
        return "";
    }
    if (!fs.existsSync(`${musicDir}/${artist}/${song}`)) {
        return "";
    }
    return `/api/songs/${artist}/${song}`;
}

async function normalizedRadio(response) {
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

async function normalizedSearchResult(response) {
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

function normalizeSearchterm(s) {
    return s.toLowerCase().trim();
}

function scoreResult(item, track, artist) {
    const title = normalizeSearchterm(item.snippet.title);
    const channel = normalizeSearchterm(item.snippet.channelTitle);
    const t = normalizeSearchterm(track);
    const a = normalizeSearchterm(artist);

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


async function searchYoutube(track, artist, config) {
    const url =
        "https://www.googleapis.com/youtube/v3/search" +
        "?part=snippet" +
        "&maxResults=20" +
        "&videoCategoryId=10" +
        "&type=video" +
        "&q=" + encodeURIComponent(artist + " " + track) +
        "&key=" + config["youtube-api-key"];

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


async function downloadVideo(directory, artist, track, cover, isrc, artist_picture, url) {
    console.log("-".repeat(20));
    console.log("Trying to download " + track);
    const artistDir = `${directory}/${toSafeFilename(artist)}`
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
    } else {
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

    if (!fs.existsSync(`${songDir}/cover.jpg`)) {
        const coverResponse = await fetch(cover);
        const buffer = await coverResponse.arrayBuffer();
        fs.writeFileSync(`${songDir}/cover.png`, Buffer.from(buffer));
        console.log(`[5/6] Cover not found, downloading...`);
    } else {
        console.log(`[5/6] Cover already present, skipped...`);
    }

    if (!fs.existsSync(`${songDir}/metadata.json`)) {
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
    } else {
        console.log(`[6/6] Song Metadata already present, skipped...`);
    }

    console.log("Finished downloading " + track);
    console.log("-".repeat(20));
}

module.exports = {
    toSafeFilename,
    resolveTrackPath,
    normalizedRadio,
    normalizedSearchResult,
    searchYoutube,
    downloadVideo
};