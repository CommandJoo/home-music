import "./Entry.css"
import {useMusic} from "../../../providers/MusicProvider.tsx";
import type {Playlist, Radio, Song} from "../../types.ts";
import {TbPlayerPlayFilled} from "react-icons/tb";
import {FaRadio} from "react-icons/fa6";
import {type CSSProperties, useState} from "react";
import {useContextMenu} from "../../../providers/ContextMenuProvider.tsx";
import Cover from "../general/Cover.tsx";
import MenuPlaylist from "../../context-menu/menus/MenuPlaylist.tsx";
import MenuRadio from "../../context-menu/menus/MenuRadio.tsx";
import MenuSong from "../../context-menu/menus/MenuSong.tsx";
import LinkArtist from "../links/LinkArtist.tsx";

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
    const {handleContextMenu} = useContextMenu();
    const {player} = useMusic();

    return <div id={"radio-entry"} className={"radio entry"} key={radio.uuid}
                onContextMenu={(e) => handleContextMenu(e, <MenuRadio radio={radio}/>)}>
        <div id={"cover-wrapper"}>
            <Cover url={radio.url.cover} alt={<FaRadio className={"cover-icon"} size={"15vh"}/>}/>
            <div id={"overlay"}></div>
            <button id={"play-button"} onClick={() => {
                player.play(radio);
            }}><TbPlayerPlayFilled size={"3.5vh"} className={"icon"}/></button>
        </div>
        <h2>{radio.title}</h2>
    </div>
}

export function PlaylistEntry(props: PlaylistEntryProps) {
    const {handleContextMenu} = useContextMenu();
    const [songs] = useState<Song[]>([]);
    const {player, changePage} = useMusic();

    const showEntries = 4;

    return <div id={"playlist-entry"} className={"playlist entry"} key={props.playlist.id} onClick={() => {
        changePage({type: "playlist"}, props.playlist.id);
    }} onContextMenu={(e) => handleContextMenu(e, <MenuPlaylist playlist={props.playlist}/>)}>
        <div id={"cover-wrapper"}>
            <Cover url={props.playlist.cover} alt={props.playlist.title}></Cover>
            <div id={"overlay"}></div>
            {props.playlist.content.length > 0 && <button id={"play-button"} onClick={() => {
                player.play(songs[0]);
                player.addQueue(songs.slice(1, songs.length));
            }}><TbPlayerPlayFilled size={"3.5vh"} className={"icon"}/></button>}
        </div>
        <h1>{props.playlist.title}</h1>
        {songs.slice(0, showEntries).map((song: Song, i) => {
            return <h2 key={i} style={{"--i": (showEntries - i) / (showEntries)} as CSSProperties}>{song.title}</h2>
        })}
    </div>
}

export function SongEntry({song}: SongEntryProps) {
    const {handleContextMenu} = useContextMenu();
    const {player} = useMusic();

    return <div id={"song-entry"} className={"song entry"} key={song.title + song.artist}
                onContextMenu={(e) => handleContextMenu(e, <MenuSong song={song}/>)}>
        <div id={"cover-wrapper"}>
            <Cover alt={song.title} url={song.url.cover}/>
            <div id={"overlay"}></div>
            <button id={"play-button"} onClick={() => {
                player.play(song);
            }}><TbPlayerPlayFilled size={"3.5vh"} className={"icon"}/></button>
        </div>
        <h2>{song.title}</h2>
        <div id={"artist"}>
            <img src={song.artist.picture} alt={song.artist.name}/>
            <LinkArtist artist={song.artist}/>
        </div>
    </div>;
}