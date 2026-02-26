import type {Playable, Radio, Song} from "../app/types.ts";
import {useCallback, useMemo, useReducer} from "react";

export type PlayerType = {
    play: (song?: Playable) => void,
    back: () => void,
    forward: () => void,
    addQueue: (songs: Playable | Playable[]) => void,

    playing?: Playable,
    queue: Song[],
    history: Playable[],

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
        case "play":
            return {
                ...state,
                playing: action.song,
                history: state.playing ? [...state.history, state.playing] : state.history,
                hasInteracted: action.song ? true : state.hasInteracted,
            };
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

export function usePlayer() {
    const [state, dispatch] = useReducer(playerReducer, {
        playing: undefined,
        history: [],
        queue: [],
        hasInteracted: false,
    });

    const play = useCallback((song?: Playable) => dispatch({type: "play", song}), []);
    const back = useCallback(() => dispatch({type: "back"}), []);
    const forward = useCallback(() => dispatch({type: "forward"}), []);
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