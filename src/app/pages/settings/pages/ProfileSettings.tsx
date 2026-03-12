import "./ProfileSettings.css"
import {useMusic} from "../../../../providers/MusicProvider.tsx";
import {createUser} from "../../../util.ts";
import {useRef, useState} from "react";
import Dropdown from "../../../components/general/Dropdown.tsx";

export function ProfileCreation() {
    const {refreshUsers} = useMusic();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<File | null>(null);
    const [name, setName] = useState("");

    async function handleUpload() {
        createUser(name, image).then(() => {
            refreshUsers()
        })

        setName("");
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    return <div id={"profile-creation"} className={"settings-panel"}>
        <h2>Create Profile</h2>
        <h3>Name:</h3>
        <input type="text" onChange={(e) => setName(e.target.value)} value={name}/>
        <h3>Profile Picture <h6>Optional</h6></h3>
        <input ref={fileInputRef} accept={"image/png"} multiple={false} type={"file"} onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) setImage(e.target.files[0])
        }}/>
        <button onClick={handleUpload}>Create</button>
    </div>
}

export function ProfileSelection() {
    const {users, changeUser, refreshUsers} = useMusic();
    return <div id={"profile-selection"} className={"settings-panel"}>
        <h2>Select Profile</h2>
        <Dropdown options={users.users.map((u) => u.id)} default={users.current_user} onSelect={(opt) => {
            changeUser(opt);
            refreshUsers();
        }}/>
    </div>
}


export default function ProfileSettings() {
    const {users} = useMusic();

    return <div id={"profile-settings"} className={"settings-subpage"}>
        {users.users.length > 0 && <ProfileSelection/>}
        <ProfileCreation/>
    </div>
}