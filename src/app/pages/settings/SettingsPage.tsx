import "./SettingsPage.css"
import {useEffect, useState} from "react";
import {useSearchParams} from "react-router";
import {useMusic} from "../../../providers/MusicProvider.tsx";
import ProfileSettings from "./pages/ProfileSettings/ProfileSettings.tsx";
import GeneralSettings from "./pages/GeneralSettings/GeneralSettings.tsx";

export default function SettingsPage() {
    const {changePage, changeUser, refreshUsers, currentUser} = useMusic();
    const [searchParams] = useSearchParams();
    const [category, setCategory] = useState("general");

    const categories = ["general", "profile"];

    useEffect(() => {
        async function load() {
            const cat = searchParams.get("category");
            if (cat) {
                setCategory(cat);
            }
        }

        load();
    }, [searchParams]);


    return <div id={"settings-page"} className={"page"}>
        <div id={"page"}>
            <div id={"settings-left"}>
                <h1>Settings</h1>
                <hr className={"settings-spacer"}/>
                {categories.map(category => {
                    return <h3 onClick={() => changePage({type: "settings"}, category)}>{category}</h3>
                })}
                <h3 className={"logout"} onClick={() => {
                    changeUser(null).then(() => {
                        refreshUsers().then(() => {
                            console.log(currentUser);
                        });
                    });
                }}>Logout</h3>
            </div>
            <div id={"settings-divider"}></div>
            <div id={"settings-right"}>
                <h1>{category}</h1>
                {category === "profile" && <ProfileSettings/>}
                {category === "general" && <GeneralSettings/>}
            </div>
        </div>
    </div>
}