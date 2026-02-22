import "./Searchbar.css"
import {useEffect, useRef, useState} from "react";
import {FaRegHeart, FaHeart, FaRadio} from "react-icons/fa6";
import {FaTimes} from "react-icons/fa";
import type {Radio} from "../types.ts";
import {useMusic} from "../../MusicProvider.tsx";

type SearchbarProps = {
    check: (radio: Radio) => boolean;
    setSearching: (searching: boolean) => void;
}

type RadioEntryProps = {
    radio: Radio
    check: (radio: Radio) => boolean;
}

export function RadioEntry(props: RadioEntryProps) {
    const [downloading, setDownloading] = useState(false);
    const {refreshCurrentUser, currentUser} = useMusic();

    useEffect(() => {
        async function load() {
            if (props.check(props.radio)) setDownloading(true);
        }
        load();
    }, [props]);

    function reload() {
        const timeout = setTimeout(() => {
            refreshCurrentUser();
        }, 15000)
        return clearTimeout(timeout);
    }

    function favorite() {
        async function load() {
            if(!currentUser) return;
            const response = await fetch(`/api/users/${currentUser.id}/radio/follow?uuid=${props.radio.uuid}`);
            const data = await response.json() as {success: boolean};
            if(data.success) {
                reload();
            }
        }
        load();
    }

    return <div className={"song"} key={props.radio.uuid}>
        <div id={"song-left"}>
            <div id={"cover-wrapper"}>
                {props.radio.url.cover.length > 0 ? <img id={"cover"} src={props.radio.url.cover}/> : <FaRadio size={"4vh"}/>}
            </div>
            <div id={"info"}>
                <h3>{props.radio.title}</h3>
                <h4>{props.radio.title}</h4>
            </div>
        </div>
        <div id={"song-right"} onClick={() => {
            if (!downloading) {
                setDownloading(true);
                favorite();
            }
        }}>
            {downloading ? <FaHeart size={"2.5vh"} className={"download " + (downloading ? "downloading" : "")} /> : <FaRegHeart className={"download " + (downloading ? "downloading" : "")} size={"2.5vh"}/>}
        </div>
    </div>
}

export default function RadioSearchbar(props: SearchbarProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [results, setResults] = useState<Radio[]>([])
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
                    `/api/radio?name=${encodeURIComponent(search)}`,
                    {signal: controller.signal}
                );

                const result = (await resp.json());
                setResults(result as Radio[]);
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
            {results.map((r: Radio, i) => {
                return <RadioEntry key={i} check={props.check} radio={r}/>
            })}
        </ul>}
    </div>
}