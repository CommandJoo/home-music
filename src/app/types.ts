export type Artist = {
    name: string;
    picture: string;
    path: string;
}

export type Song = {
    title: string;
    artist: Artist;
    metadata: {
        duration: number;
        isrc: string;
    }
    url: {
        track: string;
        cover: string;
    }
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
    type: "downloads"|"library"|"artist"|"playlist"
    artist?: Artist
    songs?: Song[];
    playlists?: Playlist[];
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
}