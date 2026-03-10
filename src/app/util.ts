import type {Artist, LoadedPins, Playlist, Song, User} from "./types.ts";

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

export async function loadPlaylist(playlist: Playlist) {
    const loaded: Song[] = [];
    for (const url of playlist.content) {
        const response = await fetch(url);
        const data = await response.json() as Song;
        loaded.push({...data, kind: "song"});
    }
    return loaded;
}

export async function searchPaylist(currentUser: User, id: string) {
    const response = await fetch(`/api/users/${currentUser.id}/playlists/${id}`);
    return await response.json() as Playlist;
}

export async function searchArtist(id: string) {
    const response = await fetch(`/api/songs/${id}`);
    return await response.json() as { data: Artist, songs: Song[] };
}