import "./Entry.css"
import {useMusic} from "../../../MusicProvider.tsx";
import type {Radio, Song} from "../../types.ts";
import {TbPlayerPlayFilled} from "react-icons/tb";
import {FaRadio} from "react-icons/fa6";
import {type CSSProperties, useEffect, useState} from "react";
import type {Playlist} from "../LibraryPage.tsx";

type SongEntryProps = {
    song: Song;
}

type PlaylistEntryProps = {
    playlist: Playlist;
}

type RadioEntryProps = {
    radio: Radio;
}

export function RadioEntry({radio}: RadioEntryProps) {
    const {player} = useMusic();
    return <div id={"radio-entry"} className={"radio entry"} key={radio.uuid}>
        <div id={"cover-wrapper"}>
            {radio.url.cover.length > 0 ? <img id={"cover"} src={radio.url.cover} alt={radio.title}></img> : <FaRadio className={"icon"} size={"15vh"}/>}
            <div id={"overlay"}></div>
            <button id={"play-button"} onClick={() => {
                player.play(radio);
            }}><TbPlayerPlayFilled size={"3.5vh"} className={"icon"}/></button>
        </div>
        <h2>{radio.title}</h2>
    </div>
}

export function PlaylistEntry(props: PlaylistEntryProps) {
    const [songs, setSongs] = useState<Song[]>([]);
    const {player} = useMusic();

    useEffect(() => {
        async function load() {
            const loaded: Song[] = [];
            for (const url of props.playlist.content) {
                const response = await fetch(url);
                const data = await response.json() as Song;
                loaded.push(data);
            }
            setSongs(loaded);
        }
        load();
    }, [props.playlist.content]);

    const showEntries = 4;

    return <div id={"playlist-entry"} className={"playlist entry"} key={props.playlist.id}>
        <div id={"cover-wrapper"}>
            <img id={"cover"} src={props.playlist.cover} alt={props.playlist.title}></img>
            <div id={"overlay"}></div>
            <button id={"play-button"} onClick={() => {
                player.play(songs[0]);
                player.addQueue(songs.slice(1, songs.length));
            }}><TbPlayerPlayFilled size={"3.5vh"} className={"icon"}/></button>
        </div>
        <h1>{props.playlist.title}</h1>
        {songs.slice(0, showEntries).map((song: Song, i) => {
            return <h2 style={{"--i": (showEntries-i)/(showEntries)} as CSSProperties}>{song.title}</h2>
        })}
    </div>
}

export function SongEntry({song}: SongEntryProps) {
    const {player, db} = useMusic();

    return <div id={"song-entry"} className={"song entry"} key={song.title + song.artist}>
        <div id={"cover-wrapper"}>
            <img id={"cover"} src={song.url.cover} alt={song.title}></img>
            <div id={"overlay"}></div>
            <button id={"play-button"} onClick={() => {
                player.play(song);
                player.addQueue(db[Math.round(Math.random() * db.length)]);
            }}><TbPlayerPlayFilled size={"3.5vh"} className={"icon"}/></button>
        </div>
        <h2>{song.title}</h2>
        <div id={"artist"}>
            <img src={song.artist.picture} alt={song.artist.name}/>
            <h4>{song.artist.name}</h4>
        </div>
    </div>;
}