import "./UserSidebarEntry.css"
import type {User, Users} from "../types.ts";
import SidebarEntry from "./SidebarEntry.tsx";
import {type CSSProperties, useEffect, useState} from "react";
import { FaPlus } from "react-icons/fa";

type UserSidebarEntryProps = {
    users?: Users
}

function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 50%)`;
}

function picture(user: User) {
    if (user.picture.length > 0) {
        return <img style={{"--color": stringToColor(user.name.length > 0 ? stringToColor(user.name) : "#333")} as CSSProperties} src={user.picture}/>
    }
    console.log(stringToColor(user.name))
    return <h1 style={{"--color": stringToColor(stringToColor(user.name))} as CSSProperties}>{user.name.charAt(0).toUpperCase()}</h1>;
}

function Account({user, close}: { user: { id: string, path: string }, close: () => void }) {
    const [userInfo, setUserInfo] = useState<User | null>(null);

    useEffect(() => {
        async function load() {
            const response = await fetch(user.path);
            const data = await response.json() as User;
            setUserInfo(data);
        }

        load();
    }, [user]);

    return <div id={"account-entry"} onClick={() => {
        close();
    }}>
        {userInfo && <>
            <div id={"preview"}>{picture(userInfo)}</div>
            <h2>{userInfo.name}</h2>
        </>}
    </div>
}

export default function UserSidebarEntry(props: UserSidebarEntryProps) {
    const [open, setOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>();
    const [users, setUsers] = useState<Users>({current_user: "", users: []});

    useEffect(() => {
        async function load() {
            if (props.users) {
                setUsers(props.users);

                for (const user of props.users.users) {
                    if (user.id === props.users.current_user) {
                        const path = user.path;
                        const response = await fetch(path);
                        const data = await response.json() as User;
                        setCurrentUser(data);
                        return;
                    }
                }
            }
        }

        load();
    }, [props.users, users.current_user]);

    function content() {
        if (open) {
            return <>
                {users.users.map((user) => {
                    return <Account close={() => {
                        setOpen(false)
                    }} user={user}></Account>
                })}
                <div id={"account-entry"} className={"add"}>
                    <FaPlus size={"4vh"} className={"icon"}/>
                </div>
            </>

        }
        return currentUser ? <SidebarEntry onClick={() => setOpen(!open)} className={"user"}
                                           preview={picture(currentUser)}>
        </SidebarEntry> : ""
    }

    return <div id={"sidebar-user-wrapper"} className={(open ? "opened" : "")}>
        <div id={"user-content"}>
            {content()}
        </div>
    </div>;
}