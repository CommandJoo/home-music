import './App.css'
import Audio from "./app/components/audio/Audio.tsx";
import Sidebar from "./app/components/sidebar/Sidebar.tsx";
import {MusicProvider, useMusic} from "./providers/MusicProvider.tsx";
import {useEffect} from "react";
import DownloadPage from "./app/pages/download/DownloadPage.tsx";
import LibraryPage from "./app/pages/library/LibraryPage.tsx";
import ArtistPage from "./app/pages/artist/ArtistPage.tsx";
import RadioPage from "./app/pages/radio/RadioPage.tsx";
import {Navigate, Route, Routes} from "react-router-dom";
import {ContextMenuProvider} from "./providers/ContextMenuProvider.tsx";
import PlaylistPage from "./app/pages/playlist/PlaylistPage.tsx";
import SettingsPage from "./app/pages/settings/SettingsPage.tsx";
import {StylingProvider, useStyling} from "./providers/StylingProvider.tsx";
import PlaylistCreationPage from "./app/pages/create_playlist/PlaylistCreationPage.tsx";

function Basis() {
    return <StylingProvider>
        <MusicProvider>
            <App/>
        </MusicProvider>
    </StylingProvider>
}


function App() {
    const {refreshUsers, reloadSongs, player} = useMusic();
    const {theme} = useStyling();

    useEffect(() => {
        reloadSongs();
        refreshUsers();
    }, [refreshUsers, reloadSongs]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            e.preventDefault();
        };

        document.addEventListener("contextmenu", handler);
        return () => document.removeEventListener("contextmenu", handler);
    }, []);


    return (
        <div id={"root"} className={theme}>
            <ContextMenuProvider>
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
                <div id={"right"}>
                    <div id={"page-top"}>
                        <Routes>
                            <Route path={"/"} element={<Navigate to={"/radio"} replace/>}/>
                            <Route path={"/library"} element={<LibraryPage/>}/>
                            <Route path={"/artist"} element={<ArtistPage/>}/>
                            <Route path={"/radio"} element={<RadioPage/>}/>
                            <Route path={"/downloads"} element={<DownloadPage/>}/>
                            <Route path={"/playlist"} element={<PlaylistPage/>}/>

                            <Route path={"/settings"} element={<SettingsPage/>}/>
                            <Route path={"/create_playlist"} element={<PlaylistCreationPage/>}/>
                        </Routes>
                    </div>
                    <div id={"page-bottom"}>
                        <Audio/>
                    </div>
                </div>
            </ContextMenuProvider>
        </div>
    )
}

export default Basis;
