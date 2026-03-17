import {TbPin, TbPlaylist} from "react-icons/tb";
import ContextMenuButton from "../ContextMenuButton.tsx";
import {useMusic} from "../../../providers/MusicProvider.tsx";
import {useContextMenu} from "../../../providers/ContextMenuProvider.tsx";
import {useEffect, useState} from "react";
import type {Playlist} from "../../types.ts";
import {pin, unpin} from "../../util.ts";

type MenuPlaylistEntryProps = {
    playlist: Playlist;
}

export default function MenuPlaylist(props: MenuPlaylistEntryProps) {
    const {close} = useContextMenu();
    const {player, currentUser, pins, refreshUsers} = useMusic();
    const [pinned, setPinned] = useState(false)


    useEffect(() => {
        async function load() {
            if (pins.playlists.some(p => p.id === props.playlist.id)) {
                setPinned(true);
            }
        }

        load();
    }, [pins.playlists, props.playlist]);

    return <>
        <ContextMenuButton icon={<TbPlaylist className={"icon"}/>} onClick={() => {
            player.addQueue(props.playlist.content);
        }}>
            Add to queue
        </ContextMenuButton>
        <ContextMenuButton icon={<TbPin className={"icon"}/>} onClick={() => {
            if (currentUser && !pinned) {
                pin(currentUser.id, "playlist", props.playlist.id).then(() => {
                    close();
                    refreshUsers();
                });
                setPinned(true);
            } else if (currentUser && pinned) {
                unpin(currentUser.id, "playlist", props.playlist.id).then(() => {
                    close();
                    refreshUsers();
                });
                setPinned(false);
            }
        }}>
            {!pinned ? "Pin to Quickplay" : "Unpin from Quickplay"}
        </ContextMenuButton>
    </>;
}