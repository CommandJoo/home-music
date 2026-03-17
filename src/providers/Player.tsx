import type {Playable, Radio, Song} from "../app/types.ts";
import {useCallback, useEffect, useMemo, useReducer, useRef} from "react";

export type PlayerType = {
    play: (song?: Playable) => void,
    back: () => void,
    forward: () => void,
    addQueue: (songs: Playable | Playable[]) => void,

    playing?: Song | Radio,
    queue: (Song | Radio)[],
    history: (Song | Radio)[],

    isSong: () => boolean,
    isRadio: () => boolean,
    asRadio: () => Radio,
    asSong: () => Song,

    hasInteracted: boolean,
    interact: () => void,
}

type PlayerState = {
    playing?: Playable;
    history: Playable[];
    queue: Playable[];
    hasInteracted: boolean;
}

type PlayerAction =
    | { type: "play"; song?: Playable }
    | { type: "back" }
    | { type: "forward" }
    | { type: "addQueue"; songs: Playable | Playable[] }
    | { type: "interact" }

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
    switch (action.type) {
        case "play": {
            if (!action.song) return {...state, playing: undefined, hasInteracted: state.hasInteracted};

            let toPlay: Song | Radio;
            let toQueue: (Song | Radio)[];

            if (action.song.kind === "song" || action.song.kind === "radio") {
                toPlay = action.song;
                toQueue = [];
            } else if (action.song.kind === "playlist") {
                const [first, ...rest] = action.song.content;
                if (!first) return state;
                toPlay = first;
                toQueue = rest;
            } else if (action.song.kind === "artist") {
                const [first, ...rest] = action.song.songs;
                if (!first) return state;
                toPlay = first;
                toQueue = rest;
            } else {
                return state;
            }

            return {
                ...state,
                playing: toPlay,
                queue: toQueue,
                history: state.playing ? [...state.history, state.playing] : state.history,
                hasInteracted: true,
            };
        }
        case "back": {
            if (state.history.length === 0) return state;
            const history = [...state.history];
            const song = history.pop();
            return {
                ...state,
                playing: song,
                history,
                queue: state.playing ? [state.playing, ...state.queue] : state.queue,
                hasInteracted: true,
            };
        }
        case "forward": {
            if (state.queue.length === 0) return state;
            const [song, ...queue] = state.queue;
            return {
                ...state,
                playing: song,
                queue,
                history: state.playing ? [...state.history, state.playing] : state.history,
                hasInteracted: true,
            };
        }
        case "addQueue":
            return {
                ...state,
                queue: [...state.queue, ...(Array.isArray(action.songs) ? action.songs : [action.songs])],
            };
        case "interact":
            return {...state, hasInteracted: true};
    }
}

export function usePlayer(onPlay?: (song: Playable) => void) {
    const onPlayRef = useRef(onPlay);
    const [state, dispatch] = useReducer(playerReducer, {
        playing: undefined,
        history: [],
        queue: [],
        hasInteracted: false,
    });

    useEffect(() => {
        onPlayRef.current = onPlay;
    }, [onPlay]);

    const play = useCallback((song?: Playable) => {
        if (song) {
            onPlayRef.current?.(song);
            if (song.kind === "playlist" && song.content[0]) onPlayRef.current?.(song.content[0]);
            if (song.kind === "artist" && song.songs[0]) onPlayRef.current?.(song.songs[0]);
        }
        dispatch({type: "play", song});
    }, []);
    const back = useCallback(() => {
        const prev = state.history[state.history.length - 1];
        if (prev) onPlayRef.current?.(prev);
        dispatch({type: "back"});
    }, [state.history]);

    const forward = useCallback(() => {
        const next = state.queue[0];
        if (next) onPlayRef.current?.(next);
        dispatch({type: "forward"});
    }, [state.queue]);
    const addQueue = useCallback((songs: Playable | Playable[]) => dispatch({type: "addQueue", songs}), []);
    const interact = useCallback(() => dispatch({type: "interact"}), []);

    const isRadio = useCallback(() => state.playing?.kind === "radio", [state.playing]);
    const isSong = useCallback(() => state.playing?.kind === "song", [state.playing]);
    const asRadio = useCallback(() => state.playing as Radio, [state.playing]);
    const asSong = useCallback(() => state.playing as Song, [state.playing]);

    return useMemo(() => ({
        play, back, forward, addQueue, interact,
        playing: state.playing,
        queue: state.queue,
        history: state.history,
        hasInteracted: state.hasInteracted,
        isRadio, isSong, asRadio, asSong,
    } as PlayerType), [play, back, forward, addQueue, interact, state, isRadio, isSong, asRadio, asSong]);
}