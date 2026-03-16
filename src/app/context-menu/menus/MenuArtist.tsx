import {TbPin} from "react-icons/tb";
import ContextMenuButton from "../ContextMenuButton.tsx";
import {useMusic} from "../../../providers/MusicProvider.tsx";
import {useContextMenu} from "../../../providers/ContextMenuProvider.tsx";
import {useEffect, useState} from "react";
import type {Artist} from "../../types.ts";
import {pin, unpin} from "../../util.ts";

type MenuArtistProps = {
    artist: Artist;
}

export default function MenuArtist(props: MenuArtistProps) {
    const {close} = useContextMenu();
    const {currentUser, pins, refreshUsers} = useMusic();
    const [pinned, setPinned] = useState(false)


    useEffect(() => {
        if (!props.artist) return;

        async function load() {
            if (pins.artists.some(a => a.id === props.artist.id)) {
                setPinned(true);
            }
        }

        load();
    }, [pins.artists, props.artist]);

    return <>
        {/*<ContextMenuButton icon={<TbPlaylist className={"icon"}/>} onClick={() => {*/}
        {/*    player.addQueue(songs);*/}
        {/*}}>*/}
        {/*    Add to queue*/}
        {/*</ContextMenuButton>*/}
        <ContextMenuButton icon={<TbPin className={"icon"}/>} onClick={() => {
            if (currentUser && !pinned) {
                pin(currentUser.id, "artist", props.artist.id).then(() => {
                    close();
                    refreshUsers();
                });
                setPinned(true);
            } else if (currentUser && pinned) {
                unpin(currentUser.id, "artist", props.artist.id).then(() => {
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