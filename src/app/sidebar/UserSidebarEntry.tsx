import "./UserSidebarEntry.css"
import type {User} from "../types.ts";
import SidebarEntry from "./SidebarEntry.tsx";
import {type CSSProperties, useEffect, useRef, useState} from "react";
import {FaPlus} from "react-icons/fa";
import {useMusic} from "../../providers/MusicProvider.tsx";

function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 60%)`;
}

function picture(user: User) {
    if (user.picture.length > 0) {
        return <img
            style={{"--color": stringToColor(user.name.length > 0 ? stringToColor(user.name) : "#333")} as CSSProperties}
            src={user.picture}/>
    }
    return <h1 style={{"--color": stringToColor(user.name)} as CSSProperties}>{user.name.charAt(0).toUpperCase()}</h1>;
}

function AddButton() {
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<File|null>(null);
    const [name, setName] = useState("");

    async function handleUpload() {
        const formData = new FormData();
        if(image) formData.append("image", image);

        await fetch(`/api/users/register?name=${encodeURIComponent(name)}`, {
            method: "POST",
            body: formData,
        });

        setName("");
        setImage(null);
        setOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    return <div id={"account-entry"} className={"add " + (open ? "open" : "")} onClick={() => {
        if (!open) setOpen(true);
    }}>
        {!open ?
            <FaPlus size={"4vh"} className={"icon"}/> :
            <div id={"form"}>
                <h3>Name:</h3>
                <input type="text" onChange={(e) => setName(e.target.value)} value={name} />
                <h3>Profile Picture <h6>Optional</h6></h3>
                <input ref={fileInputRef} accept={"image/png"} multiple={false} type={"file"} onChange={(e) => {if(e.target.files && e.target.files.length > 0) setImage(e.target.files[0])}}/>
                <button onClick={handleUpload}>Create</button>
            </div>
        }
    </div>
}

function Account({user, close, key}: { key: number, user: { id: string, path: string }, close: () => void }) {
    const {changeUser} = useMusic();
    const [userInfo, setUserInfo] = useState<User | null>(null);

    useEffect(() => {
        async function load() {
            const response = await fetch(user.path);
            const data = await response.json() as User;
            setUserInfo(data);
        }

        load();
    }, [user]);

    return <div id={"account-entry"} key={key} onClick={() => {
        changeUser(user.id);
        close();
    }}>
        {userInfo && <>
            <div id={"preview"}>{picture(userInfo)}</div>
            <h2>{userInfo.name}</h2>
        </>}
    </div>
}

export default function UserSidebarEntry() {
    const {users, currentUser} = useMusic();
    const [open, setOpen] = useState(false);

    function content() {
        if(users.users.length == 0 && !currentUser && !open) {
            return <SidebarEntry onClick={() => setOpen(!open)} className={"user"}>

            </SidebarEntry>
        }
        if(users.users.length == 0 && !currentUser && open) {
            return <AddButton/>;
        }

        if (open) {
            return <>
                {users.users.length > 0 && users.users.map((user, i) => {
                    return <Account key={i} close={() => {
                        setOpen(false)
                    }} user={user}></Account>
                })}
                <AddButton/>
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