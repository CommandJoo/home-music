import './App.css'
import Audio from "./app/audio/Audio.tsx";
import Sidebar from "./app/sidebar/Sidebar.tsx";
import {MusicProvider, useMusic} from "./providers/MusicProvider.tsx";
import {useEffect} from "react";
import DownloadPage from "./app/pages/DownloadPage.tsx";
import LibraryPage from "./app/pages/LibraryPage.tsx";
import ArtistPage from "./app/pages/ArtistPage.tsx";
import RadioPage from "./app/pages/RadioPage.tsx";
import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import {ContextMenuProvider} from "./ContextMenuProvider.tsx";


function Basis() {
    return <MusicProvider>
        <ContextMenuProvider>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </ContextMenuProvider>
    </MusicProvider>
}


function App() {
    const navigate = useNavigate();
    const {reloadSongs, refreshUsers, page, player} = useMusic();

    useEffect(() => {
        async function load() {
            reloadSongs();
            refreshUsers();
        }

        load();
    }, [refreshUsers, reloadSongs]);

    useEffect(() => {
        if (page.type === "artist") {
            navigate(page.type + "?id=" + page.artist?.id);
        } else {
            navigate(page.type);
        }
    }, [navigate, page]);

    return (
        <div id={"root"}>
            {player.queue.length > 0 && <div id={"queue"}>
                {player.queue.map((item, i) => {
                    return <div key={i}>
                        {item && item.title}
                    </div>;
                })}
            </div>}
            <div id={"left"}>
                <Sidebar/>
            </div>
            <div id={"page-content"}>
                <Routes>
                    <Route path={"library"} element={<LibraryPage/>}/>
                    <Route path={"artist"} element={<ArtistPage/>}/>
                    <Route path={"radio"} element={<RadioPage/>}/>
                    <Route path={"downloads"} element={<DownloadPage/>}/>
                </Routes>
                <div id={"bottom-bar"}>
                    <Audio/>
                </div>
            </div>
        </div>
    )
}

export default Basis;
