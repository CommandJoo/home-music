import "./Sidebar.css"
import SidebarEntry from "./sidebar-entries/SidebarEntry.tsx";
import {type CSSProperties} from "react";
import {FaDownload, FaRadio} from "react-icons/fa6";
import {BsFillCollectionFill} from "react-icons/bs";
import UserSidebarEntry from "./sidebar-entries/UserSidebarEntry.tsx";
import {useMusic} from "../../../providers/MusicProvider.tsx";
import {loadPlaylist} from "../../util.ts";
import Cover from "../general/Cover.tsx";
import {useContextMenu} from "../../../providers/ContextMenuProvider.tsx";
import MenuPlaylist from "../../context-menu/menus/MenuPlaylist.tsx";
import MenuRadio from "../../context-menu/menus/MenuRadio.tsx";
import MenuSong from "../../context-menu/menus/MenuSong.tsx";
import {FaHome} from "react-icons/fa";
import MenuArtist from "../../context-menu/menus/MenuArtist.tsx";

function stringToColor(str: string, mult: number): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (str.charCodeAt(i) * mult) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return "" + hue;
}


export default function Sidebar() {
    const {handleContextMenu} = useContextMenu();
    const {changePage, pins, player} = useMusic();

    return <div id={"sidebar"}>
        <div id={"sidebar-user"}>
            <UserSidebarEntry/>
            <hr className={"sidebar-spacer"}/>
        </div>
        <div id={"sidebar-scroll"}>
            <SidebarEntry className={"generic"} style={{
                "--hue-a": stringToColor("home", 3),
                "--hue-b": stringToColor("home", 4)
            } as CSSProperties} preview={<FaHome className={"icon"} size={"3vw"}/>} onClick={() => {
            }}>
            </SidebarEntry>
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
            {pins &&
                <>
                    {pins.playlists.length > 0 && <hr className={"sidebar-spacer"}/>}
                    {pins.playlists.map((p, i) => {
                        return <SidebarEntry key={i}
                                             onContext={(e) => handleContextMenu(e, <MenuPlaylist playlist={p}/>)}
                                             onClick={() => {
                            async function load() {
                                const loaded = await loadPlaylist(p);
                                console.log(p)
                                player.play(loaded[0]);
                                player.addQueue(loaded.slice(1, loaded.length))
                            }

                            load();
                        }} preview={p.cover.length > 0 ? <img src={p.cover} alt={p.title}/> : <h3>{p.title}</h3>}>
                        </SidebarEntry>
                    })}
                </>
            }
            {pins && <>
                {pins.radios.length > 0 && <hr className={"sidebar-spacer"}/>}
                {pins.radios.map((r, i) => {
                    return <SidebarEntry onContext={(e) => handleContextMenu(e, <MenuRadio radio={r}/>)} key={i}
                                         onClick={() => {
                        player.play(r);
                    }} preview={<Cover url={r.url.cover} alt={<FaRadio className={"alt-icon"}/>}/>}>
                    </SidebarEntry>
                })}
            </>
            }
            {
                pins && <>
                    {pins.artists.length > 0 && <hr className={"sidebar-spacer"}/>}
                    {pins.artists.map((a, i) => {
                        return <SidebarEntry onContext={(e) => handleContextMenu(e, <MenuArtist artist={a}/>)} key={i}
                                             onClick={() => {
                                                 changePage({type: "artist"}, a.id);
                                             }} preview={a.picture.length > 0 ? <img src={a.picture} alt={a.name}/> :
                            <h3>{a.name}</h3>}>
                        </SidebarEntry>
                    })}
                </>
            }
            {
                pins && <>
                    {pins.songs.length > 0 && <hr className={"sidebar-spacer"}/>}
                    {pins.songs.map((s, i) => {
                        return <SidebarEntry onContext={(e) => handleContextMenu(e, <MenuSong song={s}/>)} key={i}
                                             onClick={() => {
                            player.play(s);
                        }} preview={s.url.cover.length > 0 ? <img src={s.url.cover} alt={s.title}/> :
                            <h3>{s.title}</h3>}>
                        </SidebarEntry>
                    })}
                </>
            }
        </div>
    </div>
}