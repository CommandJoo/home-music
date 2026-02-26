import "./Sidebar.css"
import SidebarEntry from "./SidebarEntry.tsx";
import {type CSSProperties, useEffect, useState} from "react";
import type {Artist} from "../types.ts";
import {FaDownload, FaRadio} from "react-icons/fa6";
import {BsFillCollectionFill} from "react-icons/bs";
import UserSidebarEntry from "./UserSidebarEntry.tsx";
import {useMusic} from "../../providers/MusicProvider.tsx";

function stringToColor(str: string, mult: number): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (str.charCodeAt(i)*mult) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return ""+hue;
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
            <SidebarEntry className={"generic"} style={{"--hue-a": stringToColor("downloads", 10), "--hue-b": stringToColor("downloads", 4)} as CSSProperties} preview={<FaDownload className={"icon"} size={"2.7vw"}/>} onClick={() => {
                changePage({type:"downloads"})
            }}>
            </SidebarEntry>
            <SidebarEntry className={"generic"} style={{"--hue-a": stringToColor("library", 5), "--hue-b": stringToColor("collections", 1)} as CSSProperties} preview={<BsFillCollectionFill className={"icon"} size={"2.7vw"}/>} onClick={() => {
                changePage({type:"library"})
            }}>
            </SidebarEntry>
            <SidebarEntry className={"generic"} style={{"--hue-a": stringToColor("radio", 3), "--hue-b": stringToColor("radio", 3.8)} as CSSProperties} preview={<FaRadio className={"icon"} size={"2.7vw"}/>} onClick={() => {
                changePage({type:"radio"})
            }}>
            </SidebarEntry>
            <hr className={"sidebar-spacer"}/>
            {artists.map((artist,i) => {
                return <SidebarEntry key={i} onClick={() => {
                    changePage({type: "artist", artist: artist});
                }} preview={<img src={artist.picture}/>} className={"artist"}>
                </SidebarEntry>
            })}
        </div>
    </div>
}