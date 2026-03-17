import "./HomePage.css"
import {useMusic} from "../../../providers/MusicProvider.tsx";
import {PlaylistEntry, RadioEntry, SongEntry} from "../../components/entry/Entry.tsx";

export default function HomePage() {
    const {plays} = useMusic();
    return <div id={"home-page"} className={"page"}>
        <div id={"page"}>
            <div className={"grid"}>
                {plays.map(p => {
                    console.log(p);
                    if ("kind" in p && p.kind === "song") {
                        return <SongEntry song={p}/>;
                    } else if ("kind" in p && p.kind === "radio") {
                        console.log("A")
                        return <RadioEntry radio={p}/>;
                    } else if ("content" in p) {
                        return <PlaylistEntry playlist={p}/>;
                    }
                })}
            </div>
        </div>
    </div>
}