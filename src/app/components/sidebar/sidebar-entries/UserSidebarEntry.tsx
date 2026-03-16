import "./UserSidebarEntry.css"
import SidebarEntry from "./SidebarEntry.tsx";
import {type CSSProperties} from "react";
import {useMusic} from "../../../../providers/MusicProvider.tsx";
import {stringToColor} from "../../../util.ts";
import {useContextMenu} from "../../../../providers/ContextMenuProvider.tsx";
import ContextMenuButton from "../../../context-menu/ContextMenuButton.tsx";
import {TbPlaylistAdd, TbSettings, TbUser, TbUserPlus} from "react-icons/tb";

function picture(name: string, picture: string) {
    if (picture.length > 0) {
        return <img
            style={{"--color": stringToColor(name.length > 0 ? stringToColor(name) : "#333")} as CSSProperties}
            src={picture}/>
    }
    return <h1 style={{"--color": stringToColor(name)} as CSSProperties}>{name.charAt(0).toUpperCase()}</h1>;
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
        return <SidebarEntry onClick={(e) => {
                if (e) {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    open(
                        rect.left,
                        rect.bottom,
                        <UserMenu hasUser={false}/>);
                }
        }} className={"user"} preview={<TbUser className={"icon"}/>}>
        </SidebarEntry>;
    } else {
        return <SidebarEntry onClick={(e) => {
                if (e) {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    open(
                        rect.left,
                        rect.bottom,
                        <UserMenu hasUser={true}/>);
                }
        }} className={"user"} preview={picture(currentUser.name, currentUser.picture)}>
        </SidebarEntry>;
    }
}