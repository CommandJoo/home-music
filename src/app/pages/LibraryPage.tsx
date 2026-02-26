import "./LibraryPage.css"
import "./Page.css"
import {useMusic} from "../../MusicProvider.tsx";
import {PlaylistEntry} from "./entry/Entry.tsx";
import type {Playlist} from "../types.ts";

export default function LibraryPage() {
    const {currentUser} = useMusic();

    function display() {
        return currentUser && currentUser.playlists.map((playlist: Playlist) => {
            return <PlaylistEntry playlist={playlist}/>
        })
    }

    return <div id={"library-page"} className={"page"}>
        <div id={"search"}>
            <h1>Library</h1>
        </div>
        <div id={"page"}>
            <h1>Playlists</h1>
            <div id={"playlists"}>{display()}</div>
        </div>
    </div>
}