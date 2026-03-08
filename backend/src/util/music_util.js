const net = require('net');

function radioData(streamUrl, onMetadata, onError) {
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
            const n = buffer.indexOf(Buffer.from([0x0a, 0x0a]));              // \n\n

            if (rn !== -1) {
                headerEnd = rn;
                headerSkip = 4;
            } else if (n !== -1) {
                headerEnd = n;
                headerSkip = 2;
            }

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

async function resolveRedirects(url, maxRedirects = 5) {
    if (maxRedirects === 0) return url;
    try {
        const res = await fetch(url, {method: 'HEAD', redirect: 'manual'});
        if (res.status === 301 || res.status === 302) {
            return resolveRedirects(res.headers.get('location'), maxRedirects - 1);
        }
    } catch (e) {
    }
    return url;
}

module.exports = {radioData, resolveRedirects};