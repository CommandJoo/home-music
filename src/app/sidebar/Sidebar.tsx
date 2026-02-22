import "./Sidebar.css"
import SidebarEntry from "./SidebarEntry.tsx";
import {type CSSProperties, useEffect, useState} from "react";
import type {Artist} from "../types.ts";
import {FaDownload, FaRadio} from "react-icons/fa6";
import { BsFillCollectionFill } from "react-icons/bs";
import UserSidebarEntry from "./UserSidebarEntry.tsx";
import {useMusic} from "../../MusicProvider.tsx";

function stringToColor(str: string, seed: number = 0): string {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x9e3779b9); // golden ratio constant, good distribution
        hash ^= hash >>> 16;
    }
    const hue = Math.abs(hash) % 360;
    return `${hue}`;
}


export default function Sidebar() {
    const {changePage} = useMusic();
    const [artists, setArtists] = useState<Artist[]>([]);

    useEffect(() => {
        async function load() {
            const resp = await fetch("/api/artists");
            const data = await resp.json();
            setArtists(data as Artist[]);
        }

        load();
    }, []);

    return <div id={"sidebar"}>
        <UserSidebarEntry/>
        <hr className={"sidebar-spacer"}/>
        <div id={"sidebar-scroll"}>
            {/*<SidebarEntry className={"generic"} style={{"--hue-a": stringToColor("home", 3), "--hue-b": stringToColor("home", 4)} as CSSProperties} preview={<FaHome className={"icon"} size={"3vw"}/>} onClick={() => {*/}
            {/*    select(null);*/}
            {/*}}>*/}
            {/*</SidebarEntry>*/}
            <SidebarEntry className={"generic"} style={{"--hue-a": stringToColor("download", 1), "--hue-b": stringToColor("downloads", 17)} as CSSProperties} preview={<FaDownload className={"icon"} size={"2.7vw"}/>} onClick={() => {
                changePage({type:"downloads"})
            }}>
            </SidebarEntry>
            <SidebarEntry className={"generic"} style={{"--hue-a": stringToColor("library", 6), "--hue-b": stringToColor("collections", 15)} as CSSProperties} preview={<BsFillCollectionFill className={"icon"} size={"2.7vw"}/>} onClick={() => {
                changePage({type:"library"})
            }}>
            </SidebarEntry>
            <SidebarEntry className={"generic"} style={{"--hue-a": stringToColor("radio", 12), "--hue-b": stringToColor("radio", 15)} as CSSProperties} preview={<FaRadio className={"icon"} size={"2.7vw"}/>} onClick={() => {
                changePage({type:"radio"})
            }}>
            </SidebarEntry>
            {artists.map((artist,i) => {
                return <SidebarEntry key={i} onClick={() => {
                    changePage({type: "artist", artist: artist});
                }} preview={<img src={artist.picture}/>} className={"artist"}>
                </SidebarEntry>
            })}
        </div>
    </div>
}