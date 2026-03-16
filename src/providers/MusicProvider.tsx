import type {LoadedPins, Playable, Plays, Song, User, Users} from "../app/types.ts";
import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {type PlayerType, usePlayer} from "./Player.tsx";
import {useNavigate} from "react-router-dom";
import {loadPins} from "../app/util.ts";

// eslint-disable-next-line react-refresh/only-export-components
export function useNowPlaying(streamUrl?: string) {
    const [title, setTitle] = useState<string>('');

    useEffect(() => {
        if (!streamUrl) return;

        const es = new EventSource(`/api/radio/now_playing?url=${encodeURIComponent(streamUrl)}`);
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
    changePage: (page: string, id?: string) => Promise<void>;

    player: PlayerType;

    users: Users;
    refreshUsers: () => Promise<void>;
    currentUser?: User;
    changeUser: (user: string | null) => Promise<void>;

    pins: LoadedPins;
    plays: Plays;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({children}: { children: ReactNode }) {
    const navigate = useNavigate();
    const [db, setDb] = useState<Song[]>([]);
    const [users, setUsers] = useState<Users>({current_user: "", users: []});
    const [currentUser, setCurrentUser] = useState<User>();
    const [pins, setPins] = useState<LoadedPins>({radios: [], playlists: [], artists: [], songs: []});
    const [plays, setPlays] = useState<Plays>({plays: []});

    const handlePlay = useCallback((song: Playable) => {
        if (!currentUser) return;

        fetch(`/api/users/${currentUser.id}/plays?category=${song.kind}&id=${song.uuid}${song.kind === "song" ? "&artist=" + (song as Song).artist.id : ""}`, {
            method: "POST",
        }).catch(console.error).then((r) => console.log(r));
    }, [currentUser]);

    const player = usePlayer(handlePlay);

    const reloadSongs = useCallback(async () => {
        const response = await fetch("/api/songs");
        const json = await response.json() as Song[];
        setDb(json.map((s) => {
            return {...s, kind: "song"} as Song;
        }));
    }, []);
    const changePage = useCallback(async (page: string, id?: string) => {
        if (page == "downloads" || page == "library" || page == "radio" || page == "create_playlist") {
            navigate(`/${page}`);
        } else if (page == "artist") {
            if (!id) {
                console.error("Changing to an artist page requires an id");
            } else {
                navigate(`/${page}?id=${id}`);
            }
        } else if (page == "playlist") {
            if (!id) {
                console.error("Changing to a playlist page requires an id");
            } else {
                navigate(`/${page}?id=${id}`);
            }
        } else if (page == "settings") {
            if (!id) {
                console.error("Changing to the settings page requires a sub category");
            } else {
                navigate(`/${page}?category=${id}`);
            }
        }
    }, [navigate])

    const refreshUsers = useCallback(async () => {
        const response = await fetch("/api/users");
        const data = await response.json() as Users;
        setUsers(data);

        const currentId = data.current_user;
        if (currentId && currentId.length > 0) {
            for (const user of data.users) {
                if (user.id === currentId) {
                    {
                        const currentResponse = await fetch(`/api/users/${currentId}/plays`);
                        const currentData = await currentResponse.json() as Plays;
                        setPlays(currentData);
                    }
                    {
                        const currentResponse = await fetch(user.path);
                        const currentData = await currentResponse.json();

                        const rawNewUser = {
                            id: currentId,
                            name: currentData.name,
                            picture: currentData.picture,
                            volume: currentData.volume,
                            playlists: currentData.playlists,
                            radio: currentData.radio,
                            pins: currentData.pins,
                        }
                        setCurrentUser(rawNewUser);
                    }
                    break;
                }
            }
        } else {
            setCurrentUser(undefined);
        }
    }, []);

    const changeUser = useCallback(async (user: string | null) => {
        const response = await fetch(`/api/users/${user}`, {method: "PATCH"});
        const data = await response.json() as { success: boolean };
        if (data.success) {
            await refreshUsers();
        }
        console.log(data);
    }, [refreshUsers]);

    const loadUnloadedPins = useCallback(async () => {
        if (currentUser) setPins(await loadPins(currentUser, db));
    }, [currentUser, db]);

    useEffect(() => {
        if (currentUser && db.length > 0) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            loadUnloadedPins();
        }
    }, [currentUser, db, loadUnloadedPins]);

    return <MusicContext.Provider
        value={useMemo(() => ({
            db,
            reloadSongs,
            changePage,
            player,
            users,
            refreshUsers,
            currentUser,
            changeUser,
            pins,
            plays,
        }), [db, reloadSongs, changePage, player, users, refreshUsers, currentUser, changeUser, pins, plays])}>
        {children}
    </MusicContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMusic() {
    const ctx = useContext(MusicContext);
    if (!ctx) throw new Error("useUsers must be used inside a UserProvider");
    return ctx;
}