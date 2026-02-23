export type Artist = {
    id: string,
    name: string;
    picture: string;
    path: string;
}

export type Playable = {
    kind: string;
    title: string;
    url: {
        track: string;
        cover: string;
    }
}

export type Song = Playable & {
    readonly kind: "song",
    artist: Artist;
    metadata: {
        duration: number;
        isrc: string;
    }
}

export type Radio = Playable & {
    readonly kind: "radio",
    uuid: string;
    tags: string[];
}

export type Recording = {
    title: string;
    cover: string;
    isrc: string;
    artist: {
        name: string;
        picture: string;
    }
}

export type Playlist = {
    title: string;
    songs: Song[];
}

export type Page = {
    type: "downloads"|"library"|"artist"|"playlist"|"radio";
    artist?: Artist
    songs?: Song[];
    playlists?: Playlist[];
    radio?: Radio[];
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
    playlists: string[];
    radio: Radio[]
}