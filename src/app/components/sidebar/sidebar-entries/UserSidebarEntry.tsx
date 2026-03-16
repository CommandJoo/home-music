import "./UserSidebarEntry.css"
import type {User} from "../../../types.ts";
import SidebarEntry from "./SidebarEntry.tsx";
import {type CSSProperties} from "react";
import {useMusic} from "../../../../providers/MusicProvider.tsx";
import {stringToColor} from "../../../util.ts";
import {useContextMenu} from "../../../../providers/ContextMenuProvider.tsx";
import ContextMenuButton from "../../../context-menu/ContextMenuButton.tsx";
import {TbPlaylistAdd, TbSettings, TbUserPlus} from "react-icons/tb";

function picture(user: User) {
    if (user.picture.length > 0) {
        return <img
            style={{"--color": stringToColor(user.name.length > 0 ? stringToColor(user.name) : "#333")} as CSSProperties}
            src={user.picture}/>
    }
    return <h1 style={{"--color": stringToColor(user.name)} as CSSProperties}>{user.name.charAt(0).toUpperCase()}</h1>;
}

function UserMenu({hasUser}: { hasUser: boolean }) {
    const {changePage} = useMusic();
    const {close} = useContextMenu();

    if (hasUser) {
        return <div id={"user-menu"}>
            <ContextMenuButton className={"button"} onClick={() => {
                changePage("settings", "general");
                close();
            }} icon={<TbSettings className={"icon"}/>}>Settings
            </ContextMenuButton>
            <ContextMenuButton icon={<TbPlaylistAdd className={"icon"}/>} className={"button"} onClick={() => {
                changePage("create_playlist");
                close();
            }}>
                Create Playlist
            </ContextMenuButton>
        </div>;
    } else {
        return <div id={"user-menu"}>
            <ContextMenuButton icon={<TbUserPlus className={"icon"}/>} className={"button"} onClick={() => {
                changePage("settings", "profile");
                close();
            }}>Create Profile
            </ContextMenuButton>
        </div>;
    }

}

export default function UserSidebarEntry() {
    const {currentUser} = useMusic();
    const {open} = useContextMenu();

    if (!currentUser) {
        return <div id={"user-with-menu"}>
            <SidebarEntry onClick={(e) => {
                if (e) {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    open(
                        rect.left,
                        rect.bottom,
                        <UserMenu hasUser={false}/>);
                }
            }} className={"user none"} preview={<h1>x</h1>}>
            </SidebarEntry>

        </div>;
    } else {
        return <div id={"user-with-menu"}>
            <SidebarEntry onClick={(e) => {
                if (e) {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    open(
                        rect.left,
                        rect.bottom,
                        <UserMenu hasUser={true}/>);
                }
            }} className={"user selected"} preview={picture(currentUser)}>
            </SidebarEntry>
        </div>;
    }
}