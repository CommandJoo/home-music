import "./SidebarEntry.css"
import type {CSSProperties, ReactElement} from "react";

type SidebarEntryProps = {
    preview?: ReactElement
    className?: string
    onClick?: () => void
    onContext?: (x: number, y: number) => void
    style?: CSSProperties
    key?: number
}

export default function SidebarEntry(props: SidebarEntryProps) {
    return <div id={"sidebar-entry"} style={props.style} className={props.className} onClick={props.onClick}
                onContextMenu={(e) => {
                    if (props.onContext) props.onContext(e.pageX, e.pageY);
                }}>
        <div id={"entry-preview"}>
            {props.preview}
        </div>
    </div>
}