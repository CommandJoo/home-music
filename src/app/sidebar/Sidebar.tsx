import "./Sidebar.css"
import SidebarEntry from "./SidebarEntry.tsx";
import {type CSSProperties, useEffect, useState} from "react";
import type {LoadedPins} from "../types.ts";
import {FaDownload, FaRadio} from "react-icons/fa6";
import {BsFillCollectionFill} from "react-icons/bs";
import UserSidebarEntry from "./UserSidebarEntry.tsx";
import {useMusic} from "../../providers/MusicProvider.tsx";
import {loadPins} from "../util.ts";

function stringToColor(str: string, mult: number): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (str.charCodeAt(i) * mult) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return "" + hue;
}


export default function Sidebar() {
    const {changePage, currentUser, db, player} = useMusic();
    const [loadedPins, setLoadedPins] = useState<LoadedPins>();

    useEffect(() => {
        async function load() {
            if (currentUser) {
                const pins = await loadPins(currentUser, db);
                if (pins) {
                    setLoadedPins(pins);
                }
            }
        }

        load();
    }, [db, currentUser]);

    return <div id={"sidebar"}>
        <UserSidebarEntry/>
        <hr className={"sidebar-spacer"}/>
        <div id={"sidebar-scroll"}>
            {/*<SidebarEntry className={"generic"} style={{"--hue-a": stringToColor("home", 3), "--hue-b": stringToColor("home", 4)} as CSSProperties} preview={<FaHome className={"icon"} size={"3vw"}/>} onClick={() => {*/}
            {/*    select(null);*/}
            {/*}}>*/}
            {/*</SidebarEntry>*/}
            <SidebarEntry className={"generic"} style={{
                "--hue-a": stringToColor("downloads", 10),
                "--hue-b": stringToColor("downloads", 4)
            } as CSSProperties} preview={<FaDownload className={"icon"}/>} onClick={() => {
                changePage({type: "downloads"})
            }}>
            </SidebarEntry>
            <SidebarEntry className={"generic"} style={{
                "--hue-a": stringToColor("library", 5),
                "--hue-b": stringToColor("collections", 1)
            } as CSSProperties} preview={<BsFillCollectionFill className={"icon"}/>} onClick={() => {
                changePage({type: "library"})
            }}>
            </SidebarEntry>
            <SidebarEntry className={"generic"} style={{
                "--hue-a": stringToColor("radio", 3),
                "--hue-b": stringToColor("radio", 3.8)
            } as CSSProperties} preview={<FaRadio className={"icon"}/>} onClick={() => {
                changePage({type: "radio"})
            }}>
            </SidebarEntry>
            {loadedPins && <>
                <hr className={"sidebar-spacer"}/>
                {loadedPins.radios.map((r, i) => {
                    return <SidebarEntry key={i} onClick={() => {
                        player.play(r);
                    }} preview={r.url.cover.length > 0 ? <img src={r.url.cover} alt={r.title}/> : <h3>{r.title}</h3>}>
                    </SidebarEntry>
                })}
            </>
            }
            {loadedPins &&
                <>
                    <hr className={"sidebar-spacer"}/>
                    {loadedPins.playlists.map((p, i) => {
                        return <SidebarEntry key={i} onClick={() => {
                            changePage({type: "library"})
                        }} preview={p.cover.length > 0 ? <img src={p.cover} alt={p.title}/> : <h3>{p.title}</h3>}>
                        </SidebarEntry>
                    })}
                </>
            }
        </div>
    </div>
}