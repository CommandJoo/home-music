import "./GeneralSettings.css"
import Dropdown from "../../../../components/general/Dropdown.tsx";
import {useStyling} from "../../../../../providers/StylingProvider.tsx";
import {useState} from "react";

export default function GeneralSettings() {
    const {setTheme, theme} = useStyling();
    const [playback, setPlayback] = useState("web-app");

    return <div id={"general-settings"} className={"settings-subpage"}>
        <div className={"settings-panel"}>
            <h2>Theme</h2>
            <Dropdown options={["dark", "light"]} value={theme} unselectedValue={"No Theme"}
                      onSelect={(s) => setTheme(s)}/>
            <br/>
            <h2>Playback Mode (not implemented)</h2>
            <Dropdown options={["web-app", "backend"]} value={playback} unselectedValue={"No Playback Mode"}
                      onSelect={(s) => setPlayback(s)}/>
        </div>
    </div>
}