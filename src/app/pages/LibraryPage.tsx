import "./LibraryPage.css"
import "./Page.css"
import {useMusic} from "../../MusicProvider.tsx";
import {useEffect, useState} from "react";
import {PlaylistEntry} from "./entry/Entry.tsx";

export type Playlist = {
    id: string;
    title: string;
    cover: string;
    content: string[];
}

export default function LibraryPage() {
    const {currentUser} = useMusic();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        async function load() {
            const pls: Playlist[] = [];
            if(currentUser) {
                for (const playlist of currentUser.playlists) {
                    const response = await fetch(`/api/users/${currentUser.id}/playlists/${playlist}`);
                    const data = await response.json() as Playlist;
                    pls.push(data);
                }
            }
            setPlaylists(pls);
        }
        load();
    }, [currentUser]);

    function display() {
        return playlists.map((playlist: Playlist) => {
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