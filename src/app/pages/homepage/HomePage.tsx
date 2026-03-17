import "./HomePage.css"
import {useMusic} from "../../../providers/MusicProvider.tsx";
import {PlaylistEntry, RadioEntry, SongEntry} from "../../components/entry/Entry.tsx";
import type {LoadedPlays, Playable} from "../../types.ts";

export default function HomePage() {
    const {plays} = useMusic();

    function rankPlays(plays: LoadedPlays) {
        const scores = new Map<string, { item: Playable; score: number }>();

        plays.forEach((item, index) => {
            const key = item.kind === "song" ? `song-${item.uuid}`
                : item.kind === "radio" ? `radio-${item.uuid}`
                    : item.kind === "playlist" ? `playlist-${item.id}`
                        : `artist-${item.id}`;

            const recencyScore = plays.length - index; // more recent = higher score
            const existing = scores.get(key);
            if (existing) {
                existing.score += recencyScore;
            } else {
                scores.set(key, {item, score: recencyScore});
            }
        });

        return [...scores.values()]
            .sort((a, b) => b.score - a.score);
    }

    return <div id={"home-page"} className={"page"}>
        <div id={"page"}>
            <div className={"grid"}>
                {rankPlays(plays).map(p => {
                    if (p.item.kind === "song") {
                        return <SongEntry song={p.item}/>;
                    } else if (p.item.kind === "radio") {
                        return <RadioEntry radio={p.item}/>;
                    } else if (p.item.kind === "playlist") {
                        return <PlaylistEntry playlist={p.item}/>;
                    }
                })}
            </div>
        </div>
    </div>
}