import "./DownloadPage.css"
import "./Page.css"
import DownloadSearchbar from "../searchbar/DownloadSearchbar.tsx";
import {useMusic} from "../../providers/MusicProvider.tsx";
import {useState} from "react";
import {SongEntry} from "./entry/Entry.tsx";

export default function DownloadPage() {
    const {db} = useMusic();
    const [searching, setSearching] = useState<boolean>(false);

    function display() {
        return db.map((song, i) => {
            return <SongEntry key={i} song={song}/>
        })
    }

    return <div id={"download-page"} className={"page"}>
        <div id={"search"}><DownloadSearchbar setSearching={setSearching}/></div>
        <div id={"page"}>
            <div id={"songs"}>{display()}</div>
            <div id={"overlay"} className={searching ? "searching" : ""}></div>
        </div>
    </div>
}