import "./PlaylistCreationPage.css"

export default function PlaylistCreationPage() {
    return <div id={"playlist-creation-page"} className={"page"}>
        <div id={"page"}>
            <h1>Create Playlist</h1>
            <div id={"form"}>
                <div id={"head"}>
                    <label id={"cover-label"}>
                        <input id={"cover"} type={"file"} accept={"image/*"}/>
                        <span>Choose Cover</span>
                    </label>
                    <div id={"head-right"}>
                        <h2>Title</h2>
                        <input id={"title"} type={"text"} placeholder={"..."}/>
                    </div>
                </div>
                <h2>Description</h2>
                <textarea id={"description"} placeholder={"..."} maxLength={1000}/>
            </div>
        </div>
    </div>
}