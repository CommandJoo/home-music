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
        return db && db.filter(s => matches(s.title)).map((song: Song) => {
            return <SongEntry song={song}/>
        })
    }

    function displayPlaylists() {
        return currentUser && currentUser.playlists.filter(p => matches(p.title)).map((playlist: Playlist) => {
            return <PlaylistEntry playlist={playlist}/>
        })
    }

    function matches(a: string) {
        return a.toLowerCase().startsWith(search.toLowerCase());
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
            {(currentUser && currentUser.playlists.some(p => matches(p.title))) && <h1>Playlists</h1>}
            {(currentUser && currentUser.playlists.some(p => matches(p.title))) &&
                <div id={"playlists"}>{displayPlaylists()}</div>}
            {(db.some(s => matches(s.title))) && <h1>Songs</h1>}
            {(db.some(s => matches(s.title))) && <div id={"songs"}>{displaySongs()}</div>}
        </div>
    </div>
}