import './App.css'
import Audio from "./app/audio/Audio.tsx";
import Sidebar from "./app/sidebar/Sidebar.tsx";
import {MusicProvider, useMusic} from "./MusicProvider.tsx";
import {useEffect} from "react";
import DownloadPage from "./app/pages/DownloadPage.tsx";
import LibraryPage from "./app/pages/LibraryPage.tsx";
import ArtistPage from "./app/pages/ArtistPage.tsx";


function Basis() {
    return <MusicProvider>
        <App/>
    </MusicProvider>
}

function App() {
    const {reloadSongs, refreshUsers, page} = useMusic();

    useEffect(() => {
        async function load() {
            reloadSongs();
            refreshUsers();
        }

        load().then(() => {
            console.log("Reloaded songs");
        });
    }, [refreshUsers, reloadSongs]);

    function showingPage() {
        if(page?.type === "library") {
            return <LibraryPage/>
        }
        if(page?.type === "artist" && page.artist) {
            return <ArtistPage/>
        }

        return <DownloadPage/>;
    }

    return (
        <div id={"root"}>
            <div id={"left"}>
                <Sidebar/>
            </div>
            <div id={"page-content"}>
                {showingPage()}
                <div id={"bottom-bar"}>
                    <Audio/>
                </div>
            </div>
        </div>
    )
}

export default Basis;
