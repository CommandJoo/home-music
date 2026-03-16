import type {Radio} from "../../types.ts";
import {useContextMenu} from "../../../providers/ContextMenuProvider.tsx";
import {useEffect, useState} from "react";
import {useMusic} from "../../../providers/MusicProvider.tsx";
import ContextMenuButton from "../ContextMenuButton.tsx";
import {TbHeartOff, TbPin, TbPlaylist} from "react-icons/tb";
import {pin, unpin} from "../../util.ts";

type MenuRadioEntryProps = {
    radio: Radio
}

export default function MenuRadio({radio}: MenuRadioEntryProps) {
    const {close} = useContextMenu();
    const [pinned, setPinned] = useState(false);
    const {player, currentUser, refreshUsers, pins} = useMusic();

    useEffect(() => {
        async function load() {
            if (pins.radios.some(s => s.uuid === radio.uuid)) {
                setPinned(true);
            }
        }

        load();
    }, [pins, radio.uuid]);

    return <>
        <ContextMenuButton icon={<TbPlaylist className={"icon"}/>} onClick={() => {
            player.addQueue(radio);
            close();
        }}>
            Add to queue
        </ContextMenuButton>
        <ContextMenuButton icon={<TbHeartOff className={"icon"}/>} onClick={() => {
            if (currentUser) {
                fetch(`/api/users/${currentUser.id}/radio/follow?uuid=${radio.uuid}&unfollow`).then(() => {
                    refreshUsers();
                    close();
                });
            }
        }}>
            Unfollow Station
        </ContextMenuButton>
        <ContextMenuButton onClick={() => {
            if (currentUser && !pinned) {
                pin(currentUser?.id, "radio", radio.uuid).then(() => {
                    refreshUsers();
                    close();
                });
            } else if (currentUser && pinned) {
                unpin(currentUser?.id, "radio", radio.uuid).then(() => {
                    refreshUsers();
                    close();
                });
            }
        }} icon={<TbPin className={"icon"}/>}>
            {!pinned ? "Pin to Quickplay" : "Unpin from Quickplay"}
        </ContextMenuButton>
    </>;
}