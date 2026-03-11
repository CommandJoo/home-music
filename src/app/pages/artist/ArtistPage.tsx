import "./ArtistPage.css"
import "../Page.css"
import {TbPlayerPlayFilled} from "react-icons/tb";
import {SongEntry} from "../../components/entry/Entry.tsx";
import {useEffect, useState} from "react";
import {useSearchParams} from "react-router"
import type {Artist, Song} from "../../types.ts";
import {searchArtist} from "../../util.ts";
import {useMusic} from "../../../providers/MusicProvider.tsx";

export default function ArtistPage() {
    const {player} = useMusic();
    const [searchParams] = useSearchParams();
    const [artist, setArtist] = useState<{ data: Artist, songs: Song[] }>()
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function load() {
            const id = searchParams.get("id");
            if (id) {
                setArtist(await searchArtist(id));
            }
        }

        load();
    }, [searchParams]);

    function display() {
        if (artist) {
            return artist.songs.filter(song => matches(song.title)).map(song => {
                return <SongEntry song={song}/>
            })
        }
        return "";
    }

    function matches(a: string) {
        return a.toLowerCase().startsWith(search.toLowerCase());
    }

    return <div id={"artist-page"} className={"page"}>
        {artist && <>
            <div id={"search"}>
                <div id={"searchbar"}>
                    <input type={"text"} id={"searchbar-input"}
                           placeholder={`Search for ${artist.data.name + (!artist.data.name.endsWith("s") ? "'s" : "'")} songs`}
                           onChange={(e) => {
                               setSearch(e.target.value)
                           }} value={search}/>
                </div>
            </div>
            <div id={"page"}>
                <div id={"header"} className={"large-playable"}>
                    {artist.data.picture.length > 0 &&
                        <div className={"img-wrapper"}>
                            <img src={artist.data.picture} alt={""}/>
                        </div>}
                    <h1>{artist.data.name}</h1>
                    <button id={"play-button"} onClick={() => {
                        if (artist.songs) {
                            player.play(artist.songs[0]);
                            player.addQueue(artist.songs.slice(1, artist.songs.length));
                        }
                    }}><TbPlayerPlayFilled size={"3.5vh"} className={"icon"}/></button>
                </div>
                <div id={"songs"} className={"grid"}>
                    {<h1>Songs</h1>}
                    {display()}
                </div>
            </div>
        </>}

    </div>
}