import "./LibraryPage.css"
import "./Page.css"
import {useMusic} from "../../MusicProvider.tsx";
import {useEffect, useState} from "react";

type Playlist = {
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
            return <div id={"playlist"}>
                <h1>{playlist.title}</h1>
            </div>
        })
    }

    return <div id={"library-page"} className={"page"}>
        <div id={"search"}>
            Hello World
        </div>
        <div id={"page"}>
            <h1>Playlists</h1>
            <div id={"songs"}>{display()}</div>
        </div>
    </div>
}