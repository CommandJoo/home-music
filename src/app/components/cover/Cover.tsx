import "./Cover.css"
import {type ReactNode, useState} from "react";

type CoverProps = {
    url: string;
    alt: ReactNode;
}

export default function Cover(props: CoverProps) {
    const [error, setError] = useState(false);
    if (props.url && !error) {
        return <img onError={() => {
            setError(true);
        }} className={"cover"} src={props.url}/>
    }
    return <div className={"cover"}>{props.alt}</div>;
}