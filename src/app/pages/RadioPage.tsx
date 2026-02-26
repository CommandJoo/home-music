import "./RadioPage.css"
import "./Page.css"
import {useMusic} from "../../providers/MusicProvider.tsx";
import {useEffect, useState} from "react";
import {RadioEntry} from "./entry/Entry.tsx";
import type {Radio} from "../types.ts";
import RadioSearchbar from "../searchbar/RadioSearchbar.tsx";

export default function RadioPage() {
    const {currentUser, refreshCurrentUser} = useMusic();
    const [radio, setRadio] = useState<Radio[]>([]);
    const [searching, setSearching] = useState<boolean>(false);

    useEffect(() => {
        function load() {
            if(currentUser) setRadio(currentUser.radio.map(radio => {
                return {...radio, kind:"radio"};
            }));
        }

        async function refresh() {
            refreshCurrentUser();
            load();
        }
        load();
        refresh();
    }, [currentUser, refreshCurrentUser]);

    function display() {
        return radio.map((radio: Radio, i) => {
            return <RadioEntry key={i} radio={radio}/>
        })
    }

    return <div id={"radio-page"} className={"page"}>
        <div id={"search"}>
            <RadioSearchbar setSearching={setSearching}/>
        </div>
        <div id={"page"}>
            <h1>Radios</h1>
            <div id={"radios"}>{display()}</div>
            <div id={"overlay"} className={searching ? "searching" : ""}></div>
        </div>
    </div>
}