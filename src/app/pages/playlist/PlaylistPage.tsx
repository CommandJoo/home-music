import "./PlaylistPage.css"
import "../Page.css"
import {SongEntry} from "../../components/entry/Entry.tsx";
import {useEffect, useState} from "react";
import {useSearchParams} from "react-router";
import {useMusic} from "../../../providers/MusicProvider.tsx";
import {TbPlayerPlayFilled} from "react-icons/tb";
import type {Playlist} from "../../types.ts";

export default function PlaylistPage() {
    const {player} = useMusic();
    const [searchParams] = useSearchParams();
    const {currentUser} = useMusic();
    const [playlist, setPlaylist] = useState<Playlist>();
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function load() {
            const id = searchParams.get("id");
            if (id && currentUser && currentUser.playlists.some((p) => p.id === id)) {
                setPlaylist(currentUser.playlists.find((p) => p.id === id));
            }
        }

        load();
    }, [searchParams, currentUser]);

    function display() {
        return playlist ? playlist.content.filter(song => matches(song.title)).map(song => {
            return <SongEntry song={song}/>
        }) : "";
    }

    function matches(a: string) {
        return a.toLowerCase().startsWith(search.toLowerCase());
    }

    return <div id={"playlist-page"} className={"page"}>
        {playlist && <>
            <div id={"search"}>
                <div id={"searchbar"}>
                    <input type={"text"} id={"searchbar-input"} placeholder={`Search for ${playlist?.title}`}
                           onChange={(e) => {
                               setSearch(e.target.value)
                           }} value={search}/>
                </div>
            </div>
            <div id={"page"}>
                <div id={"header"} className={"large-playable"}>
                    {playlist.cover.length > 0 &&
                        <div className={"img-wrapper"}>
                            <img src={playlist.cover} alt={""}/>
                        </div>}
                    <div id={"information"}>
                        <h1>{playlist.title}</h1>
                        <p>{playlist.description}</p>
                    </div>
                    <button id={"play-button"} onClick={() => {
                        if (playlist) {
                            player.play(playlist.content[0]);
                            player.addQueue(playlist.content.slice(1, playlist.content.length));
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