import "./SidebarEntry.css"
import * as React from "react";
import {type CSSProperties, type ReactElement} from "react";

type SidebarEntryProps = {
    preview?: ReactElement
    className?: string
    onClick?: (e?: React.MouseEvent) => void
    onContext?: (e: React.MouseEvent) => void
    style?: CSSProperties
    key?: number
}

export default function SidebarEntry(props: SidebarEntryProps) {
    return <div id={"sidebar-entry"} style={props.style} className={props.className} onClick={(e) => {
        if (props.onClick) props.onClick(e)
    }}
                onContextMenu={(e) => {
                    if (props.onContext) props.onContext(e);
                }}>
        <div id={"entry-preview"}>
            {props.preview}
        </div>
    </div>
}