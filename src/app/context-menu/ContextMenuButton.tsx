import "./ContextMenuButton.css"
import {type HTMLProps, type ReactNode, useState} from "react";
import type {Song} from "../types.ts";
import {useMusic} from "../../MusicProvider.tsx";
import {TbChevronRight} from "react-icons/tb";

type ContextMenuButtonProps = HTMLProps<HTMLDivElement> & {
    icon?: ReactNode;
}

export function ContextMenuAddToPlaylistButton(props: ContextMenuButtonProps & { songs: Song[] }) {
    const {currentUser} = useMusic();

    return <ContextMenuListButton icon={props.icon} items={currentUser && currentUser.playlists.map((p) => {
        return <ContextMenuButton className={"playlist"} onClick={() => {
            async function load() {
                if (!currentUser) return;
                for (const songElement of props.songs) {
                    const res = await fetch(`/api/users/${currentUser.id}/playlists/${p.id}/add?song=${songElement.uuid}&artist=${songElement.artist.id}`);
                    console.log(await res.json())
                }
            }

            load();
        }}>
            <div className={"item"}>{p.title}</div>
        </ContextMenuButton>;
    })}>
        Add to Playlist
    </ContextMenuListButton>
}

export function ContextMenuListButton(props: ContextMenuButtonProps & { items?: React.ReactElement[] }) {
    const [open, setOpen] = useState(false);
    return <div onClick={() => {
        setOpen(true);
    }} className={"context-menu-button " + (props.className ? props.className : "")} id={props.id}>
        {props.icon && <div className={"icon"}>
            {props.icon}
        </div>}
        <div className={"description"}>
            {props.children}
        </div>
        <div id={"list"} className={open ? "open" : ""}>
            {props.items && props.items.map((e) => {
                return e;
            })}
        </div>
        <TbChevronRight className={"arrow"} size={"4vh"}/>
    </div>
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