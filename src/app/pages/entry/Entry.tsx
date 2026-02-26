import "./Entry.css"
import {useMusic} from "../../../providers/MusicProvider.tsx";
import type {Playlist, Radio, Song} from "../../types.ts";
import {TbPin, TbPlayerPlayFilled, TbPlaylist, TbPlaylistAdd} from "react-icons/tb";
import {FaRadio} from "react-icons/fa6";
import {type CSSProperties, useEffect, useState} from "react";
import {useContextMenu} from "../../../ContextMenuProvider.tsx";
import ContextMenuButton, {ContextMenuAddToPlaylistButton,} from "../../context-menu/ContextMenuButton.tsx";

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
    const {open} = useContextMenu();
    const {player} = useMusic();
    return <div id={"radio-entry"} className={"radio entry"} key={radio.uuid} onContextMenu={(e) => {
        e.preventDefault();

        async function load() {
            open(e.pageX, e.pageY, (
                <>
                    <ContextMenuButton icon={<TbPlaylist className={"icon"}/>} onClick={() => {
                        player.addQueue(radio);
                    }}>
                        Add to queue
                    </ContextMenuButton>
                    <ContextMenuButton icon={<TbPin className={"icon"}/>}>
                        Pin to Quickplay
                    </ContextMenuButton>
                </>
            ));
        }

        load();
    }}>
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
    const {open} = useContextMenu();
    const [songs, setSongs] = useState<Song[]>([]);
    const {player} = useMusic();

    useEffect(() => {
        if (!props.playlist) return;
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
    }, [props.playlist]);

    const showEntries = 4;

    return <div id={"playlist-entry"} className={"playlist entry"} key={props.playlist.id} onContextMenu={(e) => {
        e.preventDefault();

        async function load() {
            open(e.pageX, e.pageY, (
                <>
                    <ContextMenuButton icon={<TbPlaylist className={"icon"}/>} onClick={() => {
                        player.addQueue(songs);
                    }}>
                        Add to queue
                    </ContextMenuButton>
                    <ContextMenuAddToPlaylistButton icon={<TbPlaylistAdd className={"icon"}/>} songs={songs}/>
                    <ContextMenuButton icon={<TbPin className={"icon"}/>}>
                        Pin to Quickplay
                    </ContextMenuButton>
                </>
            ));
        }

        load();
    }}>
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
    const {open} = useContextMenu();
    const {player} = useMusic();

    return <div id={"song-entry"} className={"song entry"} key={song.title + song.artist} onContextMenu={(e) => {
        e.preventDefault();
        open(e.pageX, e.pageY, (
            <>
                <ContextMenuButton icon={<TbPlaylist className={"icon"}/>} onClick={() => {
                    player.addQueue(song);
                }}>
                    Add to queue
                </ContextMenuButton>
                <ContextMenuAddToPlaylistButton icon={<TbPlaylistAdd className={"icon"}/>} songs={[song]}/>
                <ContextMenuButton icon={<TbPin className={"icon"}/>}>
                    Pin to Quickplay
                </ContextMenuButton>
            </>
        ));
    }}>
        <div id={"cover-wrapper"}>
            <img id={"cover"} src={song.url.cover} alt={song.title}></img>
            <div id={"overlay"}></div>
            <button id={"play-button"} onClick={() => {
                player.play(song);
            }}><TbPlayerPlayFilled size={"3.5vh"} className={"icon"}/></button>
        </div>
        <h2>{song.title}</h2>
        <div id={"artist"}>
            <img src={song.artist.picture} alt={song.artist.name}/>
            <h4>{song.artist.name}</h4>
        </div>
    </div>;
}