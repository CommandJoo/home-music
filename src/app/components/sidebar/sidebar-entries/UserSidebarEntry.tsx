import "./UserSidebarEntry.css"
import type {User} from "../../../types.ts";
import SidebarEntry from "./SidebarEntry.tsx";
import {type CSSProperties, useState} from "react";
import {useMusic} from "../../../../providers/MusicProvider.tsx";
import {stringToColor} from "../../../util.ts";

function picture(user: User) {
    if (user.picture.length > 0) {
        return <img
            style={{"--color": stringToColor(user.name.length > 0 ? stringToColor(user.name) : "#333")} as CSSProperties}
            src={user.picture}/>
    }
    return <h1 style={{"--color": stringToColor(user.name)} as CSSProperties}>{user.name.charAt(0).toUpperCase()}</h1>;
}

export default function UserSidebarEntry() {
    const {currentUser, changePage} = useMusic();
    const [open, setOpen] = useState(false);

    if (!currentUser) {
        if (!open) {
            return <SidebarEntry onClick={() => setOpen(!open)} className={"user none"} preview={<h1>x</h1>}>
            </SidebarEntry>;
        }
        return <div id={"user-with-menu"}>
            <SidebarEntry onClick={() => setOpen(!open)} className={"user none"} preview={<h1>x</h1>}>
            </SidebarEntry>
            <div id={"user-menu"}>
                <div className={"button"} onClick={() => {
                    changePage({type: "settings"}, "profile");
                    setOpen(false);
                }}>Create Profile
                </div>
            </div>
        </div>;
    } else if (currentUser) {
        if (!open) {
            return <SidebarEntry onClick={() => setOpen(!open)} className={"user selected"}
                                 preview={picture(currentUser)}>
            </SidebarEntry>;
        }
        return <div id={"user-with-menu"}>
            <SidebarEntry onClick={() => setOpen(!open)} className={"user selected"} preview={picture(currentUser)}>
            </SidebarEntry>
            <div id={"user-menu"}>
                <div className={"button"} onClick={() => {
                    changePage({type: "settings"}, "general");
                    setOpen(false);
                }}>Settings
                </div>
                <div className={"button"} onClick={() => {
                    changePage({type: "create_playlist"});
                    setOpen(false);
                }}>
                    Create Playlist
                </div>
            </div>
        </div>;
    }
}