import "./Sidebar.css"
import SidebarEntry from "./SidebarEntry.tsx";
import {useEffect, useState} from "react";
import type {Artist, PlayItem, Users} from "../types.ts";
import {FaHome} from "react-icons/fa";
import UserSidebarEntry from "./UserSidebarEntry.tsx";

type SidebarProps = {
    select: (item: PlayItem | null) => void;
    users?: Users;
}

export default function Sidebar(props: SidebarProps) {
    const [artists, setArtists] = useState<Artist[]>([]);

    useEffect(() => {
        async function load() {
            const resp = await fetch("/api/artists");
            const data = await resp.json();
            setArtists(data as Artist[]);
        }

        load();
    }, []);

    async function select(artist: Artist | null) {
        if (!artist) {
            props.select(null);
            return;
        }
        const response = await fetch(`/api/songs/${artist.path}`);
        const songs = await response.json();

        props.select({type: "collection", item: {type: "artist", songs: songs}});
    }

    return <div id={"sidebar"}>
        <UserSidebarEntry users={props.users}/>
        <hr className={"sidebar-spacer"}/>
        <div id={"sidebar-scroll"}>
            <SidebarEntry preview={<FaHome className={"icon"} size={"3.5vw"}/>} onClick={() => {
                select(null);
            }}>
            </SidebarEntry>
            {artists.map((artist) => {
                return <SidebarEntry onClick={() => {
                    select(artist);
                }} preview={<img src={artist.picture}/>} className={"artist"}>
                </SidebarEntry>
            })}
        </div>
    </div>
}