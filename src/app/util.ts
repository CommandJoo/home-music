import type {
    Artist,
    FullArtist,
    LoadedPins,
    LoadedPlays,
    Playlist,
    Radio,
    RawArtist,
    RawFullArtist,
    RawRadio,
    RawSong,
    Song,
    User
} from "./types.ts";

export function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 60%)`;
}

export async function pin(userId: string, category: string, id: string) {
    await fetch(`/api/users/${userId}/pin?category=${category}&id=${id}`);
}

export async function unpin(userId: string, category: string, id: string) {
    await fetch(`/api/users/${userId}/pin?category=${category}&id=${id}&unpin`).then(r => console.log(r));
}

export async function loadPins(currentUser: User, db: Song[]) {
    if (currentUser) {
        const unloaded = currentUser.pins;
        const radios = currentUser.radio.filter(radio => {
            const unloadedRadios = unloaded.radios;
            return unloadedRadios.some(unloadedRadio => unloadedRadio === radio.uuid);
        }).map(radio => {
            return {...radio, kind: "radio"}
        });
        const playlists = currentUser.playlists.filter(playlist => {
            const unloadedPlaylists = unloaded.playlists;
            return unloadedPlaylists.some(unloadedPlaylist => unloadedPlaylist === playlist.id);
        });
        const songs = db.filter(song => {
            const unloadedSongs = unloaded.songs;
            return unloadedSongs.some(unloadedSong => unloadedSong.id === song.uuid && unloadedSong.artist === song.artist.id);
        });
        const artistResponse = await fetch("/api/artists");
        const artists = (await artistResponse.json() as Artist[]).filter(artist => {
            const unloadedArtists = unloaded.artists;
            return unloadedArtists.some(unloadedArtist => unloadedArtist === artist.id);
        });
        return {radios, playlists, songs, artists} as LoadedPins;
    } else {
        return {radios: [], playlists: [], songs: [], artists: []};
    }
}

export async function loadPlays(currentUser: User, plays: {
    type: "radio" | "song" | "playlist" | "artist";
    id: string;
    artist?: string;
    time_stamp: number
}[], db: Song[]): Promise<LoadedPlays> {
    const loaded = [] as LoadedPlays;

    for (const play of plays) {
        switch (play.type) {
            case "radio": {
                const r = currentUser.radio.find((r) => r.uuid === play.id);
                if (r) {
                    loaded.push({...r, kind: "radio"});
                }
                break;
            }
            case "song": {
                const s = db.find((s) => s.uuid === play.id && s.artist.id === play.artist);
                if (s) {
                    loaded.push(s);
                }
                break;
            }
            case "playlist": {
                const p = currentUser.playlists.find((p) => p.id === play.id);
                if (p) {
                    loaded.push(p);
                }
                break;
            }
            case "artist": {
                const artistResponse = await fetch("/api/artists");
                const a = (await artistResponse.json() as Artist[]).find((a) => a.id === play.id);
                if (a) {
                    loaded.push(a);
                }
                break;
            }
            default:
                throw Error(`Unknown type for plays ${play.type}`);
                break;
        }
    }

    return loaded;
}

export async function searchArtist(id: string) {
    const response = await fetch(`/api/songs/${id}`);
    const data = await response.json() as { data: RawArtist, songs: RawSong[] };
    return loadArtist({...data.data, songs: data.songs.map((s) => loadSong(s))}) as FullArtist;
}

export async function createUser(name: string, image: File | null) {
    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("name", name);

    await fetch(`/api/users`, {
        method: "POST",
        body: formData,
    });
}

export async function createPlaylist(currentUser: User, name: string, description: string, image: File | null) {
    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("title", name);
    formData.append("description", description);
    await fetch(`/api/users/${currentUser.id}/playlists`, {
        method: "POST",
        body: formData,
    }).then((r) => console.log(r));
}


export async function loadPlaylist(playlist: {
    id: string;
    cover: string;
    title: string;
    description: string;
    content: string[]
}) {
    const loaded: Song[] = [];
    for (const url of playlist.content) {
        const response = await fetch(url);
        const data = await response.json() as RawSong;
        loaded.push(loadSong(data));
    }
    return {
        kind: "playlist",
        id: playlist.id,
        cover: playlist.cover,
        title: playlist.title,
        description: playlist.description,
        content: loaded
    } as Playlist;
}

export function loadSong(song: RawSong) {
    return {...song, kind: "song"} as Song;
}

export function loadRadio(radio: RawRadio) {
    return {...radio, kind: "radio"} as Radio;
}

export function loadArtist(artist: RawFullArtist): FullArtist;
export function loadArtist(artist: RawArtist): Artist;
export function loadArtist(artist: RawArtist | RawFullArtist): Artist | FullArtist {
    return {...artist, kind: "artist"};
}