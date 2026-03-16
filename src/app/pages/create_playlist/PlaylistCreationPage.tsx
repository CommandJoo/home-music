import "./PlaylistCreationPage.css"
import {createPlaylist} from "../../util.ts";
import {useMusic} from "../../../providers/MusicProvider.tsx";
import {useRef, useState} from "react";

export default function PlaylistCreationPage() {
    const {refreshUsers, currentUser} = useMusic();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<File | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    async function handleUpload() {
        if (currentUser) createPlaylist(currentUser, name, description, image).then(() => {
            refreshUsers()
        });

        // setDescription("");
        // setName("");
        // setImage(null);
        // if (fileInputRef.current) fileInputRef.current.value = "";
    }

    return <div id={"playlist-creation-page"} className={"page"}>
        <div id={"page"}>
            <h1>Create Playlist</h1>
            <div id={"form"}>
                <div id={"inputs"}>
                    <div id={"head"}>
                        <label id={"cover-label"}>
                            <input id={"cover"} type={"file"} accept={"image/*"} ref={fileInputRef} onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) setImage(e.target.files[0])
                            }}/>
                            <span>Choose Cover</span>
                        </label>
                        <div id={"head-right"}>
                            <h2>Title</h2>
                            <input id={"title"} type={"text"} placeholder={"..."}
                                   onChange={(e) => setName(e.target.value)} value={name}/>
                        </div>
                    </div>
                    <h2>Description</h2>
                    <textarea id={"description"} placeholder={"..."} maxLength={1000}
                              onChange={(e) => setDescription(e.target.value)} value={description}/>
                </div>

                <button id={"create"} onClick={handleUpload}>Create</button>
            </div>
        </div>
    </div>
}