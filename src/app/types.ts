export type WithKind<T, K extends string> = T & {
    kind: K;
}
export type RawArtist = {
    id: string;
    name: string;
    picture: string;
    path: string;
}
export type RawSong = {
    artist: Artist;
    metadata: {
        duration: number;
        isrc: string;
    }
    uuid: string;
    title: string;
    url: {
        track: string;
        cover: string;
    }
}
export type RawRadio = {
    tags: string[];
    uuid: string;
    title: string;
    url: {
        track: string;
        cover: string;
    }
}
export type RawPlaylist = {
    id: string;
    cover: string;
    title: string;
    description: string;
    content: Song[];
}

export type Song = WithKind<RawSong, "song">;
export type Radio = WithKind<RawRadio, "radio">;
export type Playlist = WithKind<RawPlaylist, "playlist">;
export type Artist = WithKind<RawArtist, "artist">;

export type Playable = Song | Radio | Playlist | Artist;

export type Recording = {
    title: string;
    cover: string;
    isrc: string;
    artist: {
        name: string;
        picture: string;
    }
}

export type Users = {
    current_user: string;
    users: {
        id: string;
        path: string;
    }[]
}

export type User = {
    id: string;
    name: string;
    picture: string;
    volume: number;
    playlists: Playlist[];
    radio: Radio[];
    pins: {
        radios: string[];
        songs: {
            id: string;
            artist: string;
        }[];
        playlists: string[];
        artists: string[];
    }
}

export type LoadedPins = {
    radios: Radio[];
    songs: Song[];
    playlists: Playlist[];
    artists: Artist[];
}

export type LoadedPlays = (Radio | Song | Playlist | Artist)[];