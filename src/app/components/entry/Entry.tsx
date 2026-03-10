import "./Entry.css"
import {useMusic} from "../../../providers/MusicProvider.tsx";
import type {Playlist, Radio, Song} from "../../types.ts";
import {TbHeartOff, TbPin, TbPlayerPlayFilled, TbPlaylist, TbPlaylistAdd} from "react-icons/tb";
import {FaRadio} from "react-icons/fa6";
import {type CSSProperties, useEffect, useState} from "react";
import {useContextMenu} from "../../../providers/ContextMenuProvider.tsx";
import ContextMenuButton, {ContextMenuAddToPlaylistButton,} from "../../context-menu/ContextMenuButton.tsx";
import {loadPlaylist, pin, unpin} from "../../util.ts";
import Cover from "../cover/Cover.tsx";

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
    const {open, close} = useContextMenu();
    const [pinned, setPinned] = useState(false);
    const {player, currentUser, refreshCurrentUser, pins} = useMusic();

    useEffect(() => {
        async function load() {
            if (pins.radios.some(s => s.uuid === radio.uuid)) {
                setPinned(true);
            }
        }

        load();
    }, [pins, radio.uuid]);

    return <div id={"radio-entry"} className={"radio entry"} key={radio.uuid} onContextMenu={(e) => {
        e.preventDefault();

        async function load() {
            open(e.pageX, e.pageY, (
                <>
                    <ContextMenuButton icon={<TbPlaylist className={"icon"}/>} onClick={() => {
                        player.addQueue(radio);
                        close();
                    }}>
                        Add to queue
                    </ContextMenuButton>
                    <ContextMenuButton icon={<TbHeartOff className={"icon"}/>} onClick={() => {
                        if (currentUser) {
                            fetch(`/api/users/${currentUser.id}/radio/follow?uuid=${radio.uuid}&unfollow`).then(() => {
                                refreshCurrentUser();
                                close();
                            });
                        }
                    }}>
                        Unfollow Station
                    </ContextMenuButton>
                    <ContextMenuButton onClick={() => {
                        if (currentUser && !pinned) {
                            pin(currentUser?.id, "radio", radio.uuid).then(() => {
                                refreshCurrentUser();
                                close();
                            });
                        } else if (currentUser && pinned) {
                            unpin(currentUser?.id, "radio", radio.uuid).then(() => {
                                refreshCurrentUser();
                                close();
                            });
                        }
                    }} icon={<TbPin className={"icon"}/>}>
                        {!pinned ? "Pin to Quickplay" : "Unpin from Quickplay"}
                    </ContextMenuButton>
                </>
            ));
        }

        load();
    }}>
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
    const {open, close} = useContextMenu();
    const [songs, setSongs] = useState<Song[]>([]);
    const {player, currentUser, pins, changePage, refreshCurrentUser} = useMusic();
    const [pinned, setPinned] = useState(false)

    useEffect(() => {
        if (!props.playlist) return;
        loadPlaylist(props.playlist).then((loaded) => {
            setSongs(loaded)
        })

        async function load() {
            if (pins.playlists.some(p => p.id === props.playlist.id)) {
                setPinned(true);
            }
        }

        load();
    }, [pins.playlists, props.playlist]);

    const showEntries = 4;

    return <div id={"playlist-entry"} className={"playlist entry"} key={props.playlist.id} onClick={() => {
        changePage({type: "playlist"}, props.playlist.id);
    }} onContextMenu={(e) => {
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
                    <ContextMenuButton icon={<TbPin className={"icon"}/>} onClick={() => {
                        if (currentUser && !pinned) {
                            pin(currentUser.id, "playlist", props.playlist.id).then(() => {
                                refreshCurrentUser();
                                close();
                            });
                            setPinned(true);
                        } else if (currentUser && pinned) {
                            unpin(currentUser.id, "playlist", props.playlist.id).then(() => {
                                refreshCurrentUser();
                                close();
                            });
                            setPinned(false);
                        }
                    }}>
                        {!pinned ? "Pin to Quickplay" : "Unpin from Quickplay"}
                    </ContextMenuButton>
                </>
            ));
        }

        load();
    }}>
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
    const {open, close} = useContextMenu();
    const {player, changePage, currentUser, pins, refreshCurrentUser} = useMusic();
    const [pinned, setPinned] = useState(false);

    useEffect(() => {
        async function load() {
            if (pins.songs.some(s => s.uuid === song.uuid)) {
                setPinned(true);
            }
        }

        load();
    }, [pins, song.uuid]);

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
                <ContextMenuButton icon={<TbPin className={"icon"}/>} onClick={() => {
                    if (currentUser && !pinned) {
                        pin(currentUser.id, "song", song.uuid + "&artist=" + song.artist.id).then(() => {
                            refreshCurrentUser();
                            close();
                        });
                        setPinned(true);
                    } else if (currentUser && pinned) {
                        unpin(currentUser.id, "song", song.uuid + "&artist=" + song.artist.id).then(() => {
                            refreshCurrentUser();
                            close();
                        });
                        setPinned(false);
                    }
                }}>
                    {!pinned ? "Pin to Quickplay" : "Unpin from Quickplay"}
                </ContextMenuButton>
            </>
        ));
    }}>
        <div id={"cover-wrapper"}>
            <Cover alt={song.title} url={song.url.cover}/>
            <div id={"overlay"}></div>
            <button id={"play-button"} onClick={() => {
                player.play(song);
            }}><TbPlayerPlayFilled size={"3.5vh"} className={"icon"}/></button>
        </div>
        <h2>{song.title}</h2>
        <div id={"artist"} onClick={() => {
            changePage({type: "artist"}, song.artist.id);
        }}>
            <img src={song.artist.picture} alt={song.artist.name}/>
            <h4>{song.artist.name}</h4>
        </div>
    </div>;
}