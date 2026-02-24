import type {Page, Playable, Radio, Song, User, Users} from "./app/types.ts";
import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";

// eslint-disable-next-line react-refresh/only-export-components
export function useNowPlaying(streamUrl?: string) {
    const [title, setTitle] = useState<string>('');

    useEffect(() => {
        if (!streamUrl) return;

        const es = new EventSource(`/api/radio/nowplaying?url=${encodeURIComponent(streamUrl)}`);
        es.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setTitle(data.title);
        };
        return () => es.close();
    }, [streamUrl]);

    return title;
}

export type PlayerType = {
    play: (song?: Playable) => void,
    back: () => void,
    forward: () => void,
    addQueue: (songs: Playable | Playable[]) => void,

    playing?: Playable,
    queue: Song[],
    history: Playable[],

    isSong: () => boolean,
    isRadio: () => boolean,
    asRadio: () => Radio,
    asSong: () => Song,

    hasInteracted: boolean,
    interact: () => void,
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlayer() {
    const [hasInteracted, setHasInteracted] = useState(false);

    const [history, setHistory] = useState<Playable[]>([]);
    const [playing, setPlaying] = useState<Playable | undefined>();
    const [queue, setQueue] = useState<Playable[]>([]);

    const interact = useCallback(() => {
        setHasInteracted(true);
    }, []);

    const play = useCallback((song?: Playable) => {
        setPlaying(prev => {
            if (prev) setHistory(h => [...h, prev]);
            if (song) {
                interact();
            }
            return song;
        });
    }, [interact]);

    const back = useCallback(() => {
        setHistory(prev => {
            if (prev.length === 0) return prev;
            const next = [...prev];
            const song = next.pop();
            setPlaying(current => {
                if (current) setQueue(q => [current, ...q]);
                return song;
            });
            setHasInteracted(true);
            return next;
        });
    }, []);

    const forward = useCallback(() => {
        setQueue(prev => {
            if (prev.length === 0) return prev;
            const [song, ...rest] = prev;
            setPlaying(current => {
                if (current) setHistory(h => [...h, current]);
                return song;
            });
            setHasInteracted(true);
            return rest;
        });
    }, []);

    const isRadio = useCallback(() => {
        if (!playing) {
            return false;
        }
        return playing && playing.kind === "radio";
    }, [playing]);
    const isSong = useCallback(() => {
        if (!playing) {
            return false;
        }
        return playing && playing.kind === "song";
    }, [playing]);
    const asRadio = useCallback(() => {
        return playing as Radio;
    }, [playing]);
    const asSong = useCallback(() => {
        return playing as Song;
    }, [playing])


    const addQueue = useCallback((songs: Playable | Playable[]) => {
        setQueue(q => [...q, ...(Array.isArray(songs) ? songs : [songs])]);
    }, []);

    return useMemo(() => ({
        play,
        back,
        forward,
        addQueue,
        playing,
        queue,
        history,
        isRadio,
        isSong,
        asRadio,
        asSong,
        hasInteracted,
        interact
    } as PlayerType), [play, back, forward, addQueue, playing, queue, history, isRadio, isSong, asRadio, asSong, hasInteracted, interact]);
}

type MusicContextType = {
    db: Song[];
    reloadSongs: () => void;
    page: Page;
    changePage: (page: Page) => void;

    player: PlayerType;

    users: Users;
    refreshUsers: () => void;
    currentUser?: User;
    refreshCurrentUser: () => void;
    changeUser: (user: string) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({children}: { children: ReactNode }) {
    const [db, setDb] = useState<Song[]>([]);
    const [page, setPage] = useState<Page>({type: "downloads"});
    const player = usePlayer();
    const [users, setUsers] = useState<Users>({current_user: "", users: []});
    const [currentUser, setCurrentUser] = useState<User>();

    const reloadSongs = useCallback(async () => {
        const response = await fetch("/api/songs");
        const json = await response.json() as Song[];
        setDb(json.map((s) => {
            return {...s, kind: "song"} as Song;
        }));
    }, []);
    const changePage = useCallback((page: Page) => {
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
                        id: currentId,
                        name: currentData.name,
                        picture: currentData.picture,
                        playlists: currentData.playlists,
                        radio: currentData.radio,
                    });
                    break;
                }
            }
        }
    }, []);

    const refreshCurrentUser = useCallback(async () => {
        const currentId = users.current_user;
        if (currentId && currentId.length > 0) {
            for (const user of users.users) {
                if (user.id === currentId) {
                    const currentResponse = await fetch(user.path);
                    const currentData = await currentResponse.json();
                    setCurrentUser({
                        id: currentId,
                        name: currentData.name,
                        picture: currentData.picture,
                        playlists: currentData.playlists,
                        radio: currentData.radio,
                    });
                    break;
                }
            }
        }
    }, [users])

    const changeUser = useCallback(async (user: string) => {
        const response = await fetch(`/api/users/switch?id=${user}`);
        const data = await response.json() as { success: boolean };
        if (data.success) {
            await refreshUsers();
        }
    }, [refreshUsers]);


    return <MusicContext.Provider
        value={useMemo(() => ({
            db,
            reloadSongs,
            page,
            changePage,
            player,
            users,
            refreshUsers,
            currentUser,
            refreshCurrentUser,
            changeUser,
        }), [db, reloadSongs, page, changePage, player, users, refreshUsers, currentUser, refreshCurrentUser, changeUser])}>
        {children}
    </MusicContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMusic() {
    const ctx = useContext(MusicContext);
    if (!ctx) throw new Error("useUsers must be used inside a UserProvider");
    return ctx;
}