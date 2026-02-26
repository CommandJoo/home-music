import "./LibraryPage.css"
import "./Page.css"
import {useMusic} from "../../providers/MusicProvider.tsx";
import {PlaylistEntry, SongEntry} from "./entry/Entry.tsx";
import type {Playlist, Song} from "../types.ts";
import {useState} from "react";

export default function LibraryPage() {
    const {currentUser, db} = useMusic();
    const [search, setSearch] = useState("");

    function displaySongs() {
        return db && db.filter(s => s.title.startsWith(search)).map((song: Song) => {
            return <SongEntry song={song}/>
        })
    }

    function displayPlaylists() {
        return currentUser && currentUser.playlists.filter(p => p.title.startsWith(search)).map((playlist: Playlist) => {
            return <PlaylistEntry playlist={playlist}/>
        })
    }

    return <div id={"library-page"} className={"page"}>
        <div id={"search"}>
            <div id={"searchbar"}>
                <input type={"text"} id={"searchbar-input"} placeholder={`Search Library`} onChange={(e) => {
                    setSearch(e.target.value)
                }} value={search}/>
            </div>
        </div>
        <div id={"page"}>
            {(currentUser && currentUser.playlists.some(p => p.title.startsWith(search))) && <h1>Playlists</h1>}
            {(currentUser && currentUser.playlists.some(p => p.title.startsWith(search))) &&
                <div id={"playlists"}>{displayPlaylists()}</div>}
            {(db.some(s => s.title.startsWith(search))) && <h1>Songs</h1>}
            {(db.some(s => s.title.startsWith(search))) && <div id={"songs"}>{displaySongs()}</div>}
        </div>
    </div>
}