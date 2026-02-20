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

export type Collection = {
    type: "album"|"artist";
    songs: Song[];
}

export type PlayItem = {
    type: "collection"|"song";
    item: Collection|Song;
}

export type Users = {
    current_user: string;
    users: {
        id: string;
        path: string;
    }[]
}

export type User = {
    name: string;
    picture: string;
    playlists: string[];
}