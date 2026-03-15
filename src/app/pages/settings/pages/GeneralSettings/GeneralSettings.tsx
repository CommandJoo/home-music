import "./GeneralSettings.css"
import Dropdown from "../../../../components/general/Dropdown.tsx";
import {useStyling} from "../../../../../providers/StylingProvider.tsx";

export default function GeneralSettings() {
    const {setTheme, theme} = useStyling();

    return <div id={"general-settings"} className={"settings-subpage"}>
        <div className={"settings-panel"}>
            <h2>Theme</h2>
            <Dropdown options={["dark", "light"]} default={theme} onSelect={(s) => setTheme(s)}/>
            <br/>
            <h2>Playback Mode (not implemented)</h2>
            <Dropdown options={["web-app", "backend"]} default={"web-app"}/>
        </div>
    </div>
}