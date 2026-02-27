import "./ArtistPage.css"
import "./Page.css"
import {useMusic} from "../../providers/MusicProvider.tsx";
import {TbPlayerPlayFilled} from "react-icons/tb";
import {SongEntry} from "./entry/Entry.tsx";
import {useState} from "react";

export default function ArtistPage() {
    const {db, page} = useMusic();
    const [search, setSearch] = useState("");

    function display() {
        return db.filter((s) => {
            if (search.length > 0) {
                return s.artist.id === page.artist?.id && matches(s.title);
            }
            return s.artist.id === page.artist?.id;
        }).map(song => {
            return <SongEntry song={song}/>
        })
    }

    function matches(a: string) {
        return a.toLowerCase().startsWith(search.toLowerCase());
    }

    return <div id={"artist-page"} className={"page"}>
        <div id={"search"}>
            <div id={"searchbar"}>
                <input type={"text"} id={"searchbar-input"} placeholder={`Search for ${page?.artist?.name}s songs`}
                       onChange={(e) => {
                           setSearch(e.target.value)
                       }} value={search}/>
            </div>
        </div>
        <div id={"page"}>
            <div id={"artist-profile"} className={"entry"}>
                <h1>{page?.artist?.name}</h1>
                <button id={"play-button"}><TbPlayerPlayFilled size={"3.5vh"} className={"icon"}/></button>
            </div>
            <div id={"songs"} className={"grid"}>
                {(db.some(s => s.artist.id === page.artist?.id && matches(s.title))) && <h1>Songs</h1>}
                {(db.some(s => s.artist.id === page.artist?.id && matches(s.title))) && display()}
            </div>
        </div>
    </div>
}