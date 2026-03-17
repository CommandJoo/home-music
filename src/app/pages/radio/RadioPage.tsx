import "./RadioPage.css"
import "../Page.css"
import {useMusic} from "../../../providers/MusicProvider.tsx";
import {useState} from "react";
import {RadioEntry} from "../../components/entry/Entry.tsx";
import type {Radio} from "../../types.ts";
import RadioSearchbar from "../../components/searchbar/RadioSearchbar.tsx";

export default function RadioPage() {
    const {currentUser} = useMusic();
    const [searching, setSearching] = useState<boolean>(false);


    function display() {
        return currentUser && currentUser.radio.map((radio: Radio, i) => {
            return <RadioEntry key={i} radio={radio}/>
        })
    }

    return <div id={"radio-page"} className={"page"}>
        <div id={"search"}>
            <RadioSearchbar setSearching={setSearching}/>
        </div>
        <div id={"page-wrapper"}>
            <div id={"page"}>
                <h1>Radios</h1>
                <div className={"grid"}>{display()}</div>
            </div>
            <div id={"overlay"} className={searching ? "searching" : ""}></div>
        </div>
    </div>
}