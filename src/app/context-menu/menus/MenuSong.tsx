import {useContextMenu} from "../../../providers/ContextMenuProvider.tsx";
import {useMusic} from "../../../providers/MusicProvider.tsx";
import {useEffect, useState} from "react";
import type {Song} from "../../types.ts";
import ContextMenuButton, {ContextMenuAddToPlaylistButton} from "../ContextMenuButton.tsx";
import {TbPin, TbPlaylist, TbPlaylistAdd} from "react-icons/tb";
import {pin, unpin} from "../../util.ts";

type MenuSongEntryProps = {
    song: Song;
}

export default function MenuSong({song}: MenuSongEntryProps) {
    const {close} = useContextMenu();
    const {player, currentUser, pins, refreshUsers} = useMusic();
    const [pinned, setPinned] = useState(false);

    useEffect(() => {
        async function load() {
            if (pins.songs.some(s => s.uuid === song.uuid)) {
                setPinned(true);
            }
        }

        load();
    }, [pins, song.uuid]);

    return <>
        <ContextMenuButton icon={<TbPlaylist className={"icon"}/>} onClick={() => {
            player.addQueue(song);
        }}>
            Add to queue
        </ContextMenuButton>
        <ContextMenuAddToPlaylistButton icon={<TbPlaylistAdd className={"icon"}/>} songs={[song]}/>
        <ContextMenuButton icon={<TbPin className={"icon"}/>} onClick={() => {
            if (currentUser && !pinned) {
                pin(currentUser.id, "song", song.uuid + "&artist=" + song.artist.id).then(() => {
                    refreshUsers();
                    close();
                });
                setPinned(true);
            } else if (currentUser && pinned) {
                unpin(currentUser.id, "song", song.uuid + "&artist=" + song.artist.id).then(() => {
                    refreshUsers();
                    close();
                });
                setPinned(false);
            }
        }}>
            {!pinned ? "Pin to Quickplay" : "Unpin from Quickplay"}
        </ContextMenuButton>
    </>;
}