import "./Searchbar.css"
import {useEffect, useRef, useState} from "react";
import {FaDownload} from "react-icons/fa6";
import {FaTimes} from "react-icons/fa";
import type {Recording} from "../types.ts";
import {useMusic} from "../../MusicProvider.tsx";

type SearchbarProps = {
    check: (recording: Recording) => boolean;
    setSearching: (searching: boolean) => void;
}

type SongEntryProps = {
    recording: Recording
    check: (recording: Recording) => boolean;
}

export function SongEntry(props: SongEntryProps) {
    const [downloading, setDownloading] = useState(false)
    const {reloadSongs} = useMusic();

    useEffect(() => {
        async function load() {
            if (props.check(props.recording)) setDownloading(true);
        }
        load();
    }, [props]);

    function reload() {
        const timeout = setTimeout(() => {
            reloadSongs();
        }, 15000)
        return clearTimeout(timeout);
    }

    async function downloadTrack(track: string, artist: string, image: string, isrc: string, artist_picture: string) {
        reload();
        await fetch(`/api/download?track=${track}&artist=${artist}&cover=${image}&isrc=${isrc}&artist_picture=${btoa(encodeURIComponent(artist_picture))}`, {method: "POST"});
    }

    function key() {
        return props.recording.title.toLowerCase().replace(" ", "-") + "." + props.recording.artist.name.toLowerCase().replace(" ", "-");
    }

    return <div className={"song"} key={key()}>
        <div id={"song-left"}>
            <img id={"cover"} src={props.recording.cover}/>
            <div id={"info"}>
                <h3>{props.recording.title}</h3>
                <h4>{props.recording.artist.name}</h4>
            </div>
        </div>
        <div id={"song-right"} onClick={() => {
            if (!downloading) {
                setDownloading(true);
                downloadTrack(props.recording.title, props.recording.artist.name, props.recording.cover, props.recording.isrc, props.recording.artist.picture);
            }
        }}>
            <FaDownload className={"download " + (downloading ? "downloading" : "")} size={"2.5vh"}></FaDownload>
        </div>
    </div>
}

export default function Searchbar(props: SearchbarProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [results, setResults] = useState<Recording[]>([])
    const [search, setSearch] = useState("")

    useEffect(() => {
        const controller = new AbortController();

        const timeout = setTimeout(async () => {
            if (search.length < 3) {
                setResults([]);
                props.setSearching(false);
                return;
            }

            try {
                const resp = await fetch(
                    `/api/search?q=${encodeURIComponent(search)}`,
                    {signal: controller.signal}
                );

                const result = (await resp.json());
                setResults(result as Recording[]);
                props.setSearching(true);
            } catch (e) {
                console.error(e);
            }
        }, 250);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };

    }, [search]);

    return <div id={"searchbar"} onKeyDown={(e) => {
        if (e.key === "Escape") {
            setResults([]);
            setSearch("");
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    }}>
        <input ref={inputRef} type={"text"} placeholder={"Search..."} onChange={(e) => setSearch(e.target.value)}
               id={"searchbar-input"}/>
        <div id={"searchbar-clear"} onClick={() => {
            setSearch("");
            setResults([]);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }}>
            <FaTimes className={"close"} size={"2.5vh"}/>
        </div>
        {(results && results.length > 0) && <ul id={"searchbar-results"}>
            {results.map((r: Recording) => {
                return <SongEntry key={r.isrc} check={props.check} recording={r}/>
            })}
        </ul>}
    </div>
}