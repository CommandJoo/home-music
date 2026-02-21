import type {Song, Users, User, Page} from "./app/types.ts";
import {createContext, type ReactNode, useCallback, useContext, useState} from "react";

export class Player {
    private history: Song[];
    private playing?: Song;
    private queue: Song[];

    constructor() {
        this.history = [];
        this.playing = undefined;
        this.queue = [];
    }

    addQueue(song: Song): void;
    addQueue(value: Song|Song[]): void {
        if(length in value) {
            for (const song of value as Song[]) {
                this.addQueue(song);
            }
        }else {
            this.queue.push(value as Song);
        }
    }

    play(song?: Song): void {
        if(this.playing) {
            this.history.push(this.playing);
        }
        this.playing = song;
    }

    back(): void {
        if(this.history.length <= 0) return;
        if(this.playing) {
            this.queue.unshift(this.playing);
        }
        this.playing = this.history[this.history.length - 1];
    }

    forward(): void {
        if(this.playing) {
            this.history.push(this.playing);
        }
        if(this.queue.length > 0) {
            this.playing = this.queue.shift();
        }
    }

    song() {
        return this.playing;
    }

    isPlaying() {
        return this.playing != undefined;
    }

}

type MusicContextType = {
    db: Song[];
    reloadSongs: () => void;
    page?: Page;
    changePage: (page?: Page) => void;

    player: Player;

    users: Users;
    refreshUsers: () => void;
    currentUser?: User;
    changeUser: (user: string) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({children}: { children: ReactNode }) {
    const [db, setDb] = useState<Song[]>([]);
    const [page, setPage] = useState<Page | undefined>();
    const [player] = useState<Player>(new Player());
    const [users, setUsers] = useState<Users>({current_user: "", users: []});
    const [currentUser, setCurrentUser] = useState<User>();

    const reloadSongs = useCallback(async () => {
        const response = await fetch("/api/songs");
        const json = await response.json() as Song[];
        setDb(json);
    }, []);
    const changePage = useCallback((page: Page | undefined) => {
        setPage(page);
    }, [])

    const refreshUsers = useCallback(async () => {
        const response = await fetch("/api/users");
        const data = await response.json() as Users;
        setUsers(data);

        const currentId = data.current_user;
        if (currentId && currentId.length > 0) {
            for (const user of data.users) {
                if (user.id === currentId) {
                    const currentResponse = await fetch(user.path);
                    const currentData = await currentResponse.json();
                    setCurrentUser({
                        name: currentData.name,
                        picture: currentData.picture,
                        playlists: currentData.playlists,
                        id: currentId
                    });
                    break;
                }
            }
        }
    }, []);
    const changeUser = useCallback(async (user: string) => {
        const response = await fetch(`/api/users/switch?id=${user}`);
        const data = await response.json() as { success: boolean };
        if (data.success) {
            await refreshUsers();
        }
    }, [refreshUsers]);

    return <MusicContext.Provider
        value={{db, reloadSongs, page, changePage, player, users, refreshUsers, currentUser, changeUser}}>
        {children}
    </MusicContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMusic() {
    const ctx = useContext(MusicContext);
    if (!ctx) throw new Error("useUsers must be used inside a UserProvider");
    return ctx;
}