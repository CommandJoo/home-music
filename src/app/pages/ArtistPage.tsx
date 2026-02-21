import "./ArtistPage.css"
import "./Page.css"
import {useMusic} from "../../MusicProvider.tsx";

export default function ArtistPage() {
    const {db, page, player} = useMusic();


    function display() {
        return db.filter((s) => {
            return s.artist.name === page?.artist?.name;
        }).map(song => {
            return <div className={"song"} key={song.title + song.artist} onClick={() => {
                player.play(song);
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

    return <div id={"artist-page"} className={"page"}>
        <div id={"search"}>
            Hello World
        </div>
        <div id={"page"}>
            <h1>{page?.artist?.name}</h1>
            <h1>Songs</h1>
            <div id={"songs"}>{display()}</div>
        </div>
    </div>
}