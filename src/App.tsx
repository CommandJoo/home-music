import './App.css'
import {useEffect, useState} from "react";
import Audio from "./app/audio/Audio.tsx";
import Sidebar from "./app/sidebar/Sidebar.tsx";
import type {Collection, PlayItem, Recording, Song, User, Users} from "./app/types.ts";
import Searchbar from "./app/searchbar/Searchbar.tsx";

type MusicProviderType = {
    db: Song[];
    reloadSongs: () => void;
    page?: Collection;
    changePage: (page: Collection) => void;
    playing: Song;
    setPlaying: (playing: Song) => void;

    users: Users;
    refreshUsers: () => void;
    currentUser: User;
}

function App() {
    const [db, setDb] = useState<Song[]>([]);
    const [showing, setShowing] = useState<Collection | null>(null)
    const [selected, setSelected] = useState<Song | null>(null);
    const [users, setUsers] = useState<Users|undefined>(undefined);

    async function loadDb() {
        const response = await fetch("/api/songs");
        const json = await response.json() as Song[];
        setDb(json);
    }
    async function loadUsers() {
        const response = await fetch("/api/users");
        const data = await response.json() as Users;
        setUsers(data);
    }
    useEffect(() => {
        async function load() {
            await loadDb();
            await loadUsers();
        }

        load();
    }, []);

    function checkPresence(recording: Recording): boolean {
        console.log(recording.title, recording.isrc);
        return db.some(item => item.metadata.isrc == recording.isrc);
    }

    function show(item: PlayItem|null) {
        if(!item) {
            setShowing(null);
            return;
        }
        if (item.type === "collection") {
            setShowing(item.item as Collection)
        }
    }

    function display() {
        if(showing != null) {
            return showing.songs.map(song => {
                return <div className={"song"} key={song.title + song.artist} onClick={() => {
                    setSelected(song);
                }}>
                    <img id={"cover"} src={song.url.cover} alt={song.title}/>
                    <h2>{song.title}</h2>
                    <div id={"artist"}>
                        <img src={song.artist.picture}/>
                        <h4>{song.artist.name}</h4>
                    </div>
                </div>;
            })
        }

        return db.map(song => {
            return <div className={"song"} key={song.title + song.artist} onClick={() => {
                setSelected(song);
            }}>
                <img id={"cover"} src={song.url.cover} alt={song.title}/>
                <h2>{song.title}</h2>
                <div id={"artist"}>
                    <img src={song.artist.picture}/>
                    <h4>{song.artist.name}</h4>
                </div>
            </div>;
        })
    }

    return (
        <div id={"root"}>
            <div id={"left"}>
                <Sidebar select={show} users={users}/>
            </div>
            <div id={"page-content"}>
                <div id={"search"}>
                    <Searchbar check={checkPresence} updateDb={() => {
                        setTimeout(() => {
                            loadDb();
                        }, 15000)
                    }}/>
                </div>
                <div id={"page"}>
                    <div id={"songs"}>
                        {
                            display()
                        }
                    </div>
                </div>
                <div id={"bottom-bar"}>
                    <Audio song={selected}/>
                </div>
            </div>
        </div>
    )
}

export default App
