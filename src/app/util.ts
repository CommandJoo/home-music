import type {Artist, LoadedPins, Song, User} from "./types.ts";

export async function pin(userId: string, category: string, id: string) {
    console.log("Pin")
    await fetch(`/api/users/${userId}/pin?category=${category}&id=${id}`);
}

export async function loadPins(currentUser: User, db: Song[]) {
    if (currentUser) {
        console.log(currentUser);
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
            return unloadedSongs.some(unloadedSong => unloadedSong === song.uuid);
        });
        const artistResponse = await fetch("/api/artists");
        const artists = (await artistResponse.json() as Artist[]).filter(artist => {
            const unloadedArtists = unloaded.artists;
            return unloadedArtists.some(unloadedArtist => unloadedArtist === artist.id);
        });
        return {radios, playlists, songs, artists} as LoadedPins;
    } else {
        return;
    }
}