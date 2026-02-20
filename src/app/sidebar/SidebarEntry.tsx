import "./SidebarEntry.css"
import type {CSSProperties, ReactElement} from "react";

type SidebarEntryProps = {
    preview?: ReactElement
    children?: ReactElement
    className?: string
    onClick?: () => void
    style?: CSSProperties
}

export default function SidebarEntry(props: SidebarEntryProps) {
    return <div id={"sidebar-entry"} style={props.style} className={props.className} onClick={props.onClick}>
        <div id={"entry-preview"}>
            {props.preview}
        </div>
        <div id={"entry-content"}>
            {props.children}
        </div>
    </div>
}