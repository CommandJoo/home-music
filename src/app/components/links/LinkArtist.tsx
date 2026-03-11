import type {Artist} from "../../types.ts";
import "./Link.css";
import {useMusic} from "../../../providers/MusicProvider.tsx";
import {useContextMenu} from "../../../providers/ContextMenuProvider.tsx";
import MenuArtist from "../../context-menu/menus/MenuArtist.tsx";

type LinkArtistProps = {
    artist: Artist;
}

export default function LinkArtist(props: LinkArtistProps) {
    const {handleContextMenu} = useContextMenu();
    const {changePage} = useMusic();
    return <div onContextMenu={(e) => handleContextMenu(e, <MenuArtist artist={props.artist}/>)} id={"link-artist"}
                className={"link"} onClick={() => changePage({type: "artist"}, props.artist.id)}>
        {props.artist.name}
    </div>
}