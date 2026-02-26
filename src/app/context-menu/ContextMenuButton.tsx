import "./ContextMenuButton.css"
import {type HTMLProps, type ReactNode, useState} from "react";
import type {Song} from "../types.ts";
import {useMusic} from "../../MusicProvider.tsx";

type ContextMenuButtonProps = HTMLProps<HTMLDivElement> & {
    icon?: ReactNode;
}

export function ContextMenuAddToPlaylistButton(props: ContextMenuButtonProps & { songs: Song[] }) {
    const {currentUser} = useMusic();
    const [open, setOpen] = useState(false);

    return <>
        <ContextMenuButton icon={props.icon} onClick={() => setOpen(true)}>
            Add to Playlist
            {<div id={"playlists"} className={open ? "open" : ""}>
                {currentUser && currentUser.playlists.map((p) => {
                    return <ContextMenuButton className={"playlist"} onClick={() => {
                        async function load() {
                            if (!currentUser) return;
                            for (const songElement of props.songs) {
                                await fetch(`/api/users/${currentUser.id}/playlists/${p}/add?song=${songElement.uuid}&artist=${songElement.artist.id}`);
                            }
                        }

                        load();
                        setOpen(false);
                    }}>{p.title}</ContextMenuButton>;
                })}
            </div>}
        </ContextMenuButton>
    </>
}

export default function ContextMenuButton(props: ContextMenuButtonProps) {
    return <div onClick={(e) => {
        if (props.onClick) props.onClick(e)
    }} className={"context-menu-button " + (props.className ? props.className : "")} id={props.id}>
        {props.icon && <div className={"icon"}>
            {props.icon}
        </div>}
        <div className={"description"}>
            {props.children}
        </div>
    </div>
}