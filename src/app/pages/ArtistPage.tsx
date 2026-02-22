import "./ArtistPage.css"
import "./Page.css"
import {useMusic} from "../../MusicProvider.tsx";
import {TbPlayerPlayFilled} from "react-icons/tb";
import {SongEntry} from "./entry/Entry.tsx";

export default function ArtistPage() {
    const {db, page} = useMusic();


    function display() {
        return db.filter((s) => {
            return s.artist.name === page?.artist?.name;
        }).map(song => {
            return <SongEntry song={song}/>
        })
    }

    return <div id={"artist-page"} className={"page"}>
        <div id={"search"}>
            {`Search for ${page?.artist?.name}s songs`}
        </div>
        <div id={"page"}>
            <div id={"songs"}>
                <div id={"artist-profile"} className={"entry"}>
                    <h1>{page?.artist?.name}</h1>
                    <button id={"play-button"}><TbPlayerPlayFilled size={"3.5vh"} className={"icon"}/></button>
                </div>
                <h1>Songs</h1>
                {display()}
            </div>
        </div>
    </div>
}