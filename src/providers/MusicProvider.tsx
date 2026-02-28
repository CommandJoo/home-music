import type {Page, Song, User, Users} from "../app/types.ts";
import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {type PlayerType, usePlayer} from "./Player.tsx";
import {useNavigate} from "react-router-dom";

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
    const navigate = useNavigate();
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
        if (page.type == "downloads" || page.type == "library" || page.type == "radio") {
            navigate(`/${page.type}`);
        } else if (page.type == "artist") {
            navigate(`/${page.type}?id=${page.artist?.id}`);
        }
    }, [navigate])

    const refreshUsers = useCallback(async () => {
        // console.trace("refreshUsers called");
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
                        pins: currentData.pins,
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
                        pins: currentData.pins,
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