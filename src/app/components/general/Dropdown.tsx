import "./Dropdown.css"
import {useEffect, useState} from "react";

type DropdownProps = {
    options: string[];
    value: string;
    unselectedValue: string;
    onSelect?: (value: string) => void;
}

export default function Dropdown(props: DropdownProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("");

    useEffect(() => {
        if (!props.value) {
            const load = async () => setSelected(props.unselectedValue);
            load();
        } else {
            const load = async () => setSelected(props.value);
            load();
        }
    }, [props.value]);

    return <div id={"dropdown"}>
        <div id={"preview"} className={!open ? "open" : ""}
             onClick={() => setOpen(!open)}>{selected}</div>
        <div id={"list"} className={open ? "open" : ""}>
            {props.options.map((option, i) => {
                return <div className={"option"} key={i} onClick={() => {
                    setSelected(option);
                    if (props.onSelect) props.onSelect(option);
                    setOpen(false);
                }}>{option}</div>
            })}
        </div>
    </div>
}