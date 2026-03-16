import "./PlaylistPage.css"
import "../Page.css"
import {SongEntry} from "../../components/entry/Entry.tsx";
import {useEffect, useState} from "react";
import {useSearchParams} from "react-router";
import {useMusic} from "../../../providers/MusicProvider.tsx";
import {TbPlayerPlayFilled} from "react-icons/tb";
import type {Playlist, Song} from "../../types.ts";
import {loadPlaylist, searchPaylist} from "../../util.ts";

export default function PlaylistPage() {
    const {player} = useMusic();
    const [searchParams] = useSearchParams();
    const {currentUser} = useMusic();
    const [playlist, setPlaylist] = useState<Playlist>();
    const [songs, setSongs] = useState<Song[]>()
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function load() {
            const id = searchParams.get("id");
            if (id && currentUser) {
                setPlaylist(await searchPaylist(currentUser, id));
            }
        }

        load();
    }, [searchParams, currentUser]);

    useEffect(() => {
        async function load() {
            if (playlist) {
                setSongs(await loadPlaylist(playlist));
            }
        }

        load();
    }, [playlist]);

    function display() {
        return songs ? songs.filter(song => matches(song.title)).map(song => {
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
                        if (songs) {
                            player.play(songs[0]);
                            player.addQueue(songs.slice(1, songs.length));
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