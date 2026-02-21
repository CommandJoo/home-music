import "./DownloadPage.css"
import "./Page.css"
import Searchbar from "../searchbar/Searchbar.tsx";
import {useMusic} from "../../MusicProvider.tsx";
import type {Recording} from "../types.ts";
import {useState} from "react";

export default function DownloadPage() {
    const {db, player} = useMusic();
    const [searching, setSearching] = useState<boolean>(false);

    function checkPresence(recording: Recording): boolean {
        console.log(recording.title, recording.isrc);
        return db.some(item => item.metadata.isrc == recording.isrc);
    }

    function display() {
        return db.map(song => {
            return <div className={"song"} key={song.title + song.artist} onClick={() => {
                player.play(song)
            }}>
                <img id={"cover"} src={song.url.cover} alt={song.title}/>
                <h2>{song.title}</h2>
                <div id={"artist"}>
                    <img src={song.artist.picture} alt={song.artist.name}/>
                    <h4>{song.artist.name}</h4>
                </div>
            </div>;
        })
    }

    return <div id={"download-page"} className={"page"}>
        <div id={"search"}><Searchbar setSearching={setSearching} check={checkPresence}/></div>
        <div id={"page"}>
            <div id={"songs"}>{display()}</div>
            <div id={"overlay"} className={searching ? "searching" : ""}></div>
        </div>
    </div>
}