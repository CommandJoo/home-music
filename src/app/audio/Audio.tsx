import "./Audio.css";
import {type CSSProperties, useEffect, useRef, useState} from "react";

import {FaVolumeHigh, FaVolumeXmark} from "react-icons/fa6";
import {
    TbPlayerPlayFilled,
    TbPlayerPauseFilled,
    TbPlayerSkipForwardFilled,
    TbPlayerSkipBackFilled
} from "react-icons/tb";
import {useMusic} from "../../MusicProvider.tsx";

function toMinutes(seconds: number): string {
    let minutes = 0;
    while (seconds > 60) {
        minutes++;
        seconds -= 60;
    }

    return (minutes < 10 ? "0" : "") + String(minutes) + ":" + (seconds < 10 ? "0" : "") + seconds;
}

export default function Audio() {
    const audio = useRef<HTMLAudioElement | null>(null);
    const {player, page, db} = useMusic();

    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [paused, setPaused] = useState(false);
    const [volume, setVolume] = useState(0);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        const el = audio.current;
        if (!el) return;

        const onLoadedMetadata = () => {
            const d = Number.isFinite(el.duration) ? el.duration : 0;
            setDuration(Math.round(d));
            setPaused(el.paused);
            setVolume(el.volume);
            el.play();
        };

        const onTimeUpdate = () => {
            setCurrentTime(Math.round(el.currentTime));
            setPaused(el.paused);
        };

        const onDurationChange = () => {
            const d = Number.isFinite(el.duration) ? el.duration : 0;
            setDuration(Math.round(d));
            setPaused(el.paused);
        };

        const onVolumeChange = () => {
            setVolume(el.volume);
        }

        const onEnded = () => {
            setPaused(true);

            async function next() {
                if (page && page.songs) {
                    const song = page.songs[Math.round(Math.random() * page.songs.length)];
                    player.play(song);
                    return;
                }
                player.play(db[Math.round(Math.random() * db.length)]);
            }
            next();
        }

        el.addEventListener("loadedmetadata", onLoadedMetadata);
        el.addEventListener("timeupdate", onTimeUpdate);
        el.addEventListener("durationchange", onDurationChange);
        el.addEventListener("volumechange", onVolumeChange);
        el.addEventListener("ended", onEnded)

        onLoadedMetadata();

        return () => {
            el.removeEventListener("loadedmetadata", onLoadedMetadata);
            el.removeEventListener("timeupdate", onTimeUpdate);
            el.removeEventListener("durationchange", onDurationChange);
            el.removeEventListener("volumechange", onVolumeChange);
            el.removeEventListener("ended", onEnded);
        };
    }, [db, page, player]);

    function changeTime(value: number) {
        const el = audio.current;
        if (!el) return;
        el.currentTime = value;
        setCurrentTime(value);
    }

    function changeVolume(value: number) {
        if (!audio.current) return;
        audio.current.volume = value;
    }

    function toggle() {
        const el = audio.current;
        if (!el) return;
        if (el.paused) {
            el.play();
            setPaused(false);
        } else {
            el.pause();
            setPaused(true);
        }
    }

    function toggleMute() {
        if (!audio.current) return;
        audio.current.muted = !audio.current.muted;
        setMuted(audio.current.muted);
    }

    return <div id="audio-controller" className={!player.isPlaying() ? "no-song" : ""}>
        <div id={"audio-left"}>
            <div id={"cover"}>
                <img src={player.song()?.url.cover} alt={player.song()?.title}/>
            </div>
            <div id={"info"}>
                <h3>{player.song()?.title}</h3>
                <h5>{player.song()?.artist.name}</h5>
            </div>
        </div>
        <div id={"audio-middle"}>
            <audio ref={audio} controls src={player.song()?.url.track}/>
            <div id="controls">
                <div id={"top"}>
                    <div id={"prev"}><TbPlayerSkipBackFilled className={"icon"} size={"3vh"}/></div>
                    <div id={"play"} onClick={() => {
                        if(player.song()) toggle();
                    }}>{!paused ? <TbPlayerPauseFilled className={"icon"} size={"3vh"}/> :
                        <TbPlayerPlayFilled className={"icon"} size={"3vh"}/>}</div>
                    <div id={"next"}><TbPlayerSkipForwardFilled className={"icon"} size={"3vh"}/></div>
                </div>
                <div id={"bottom"}>
                    <a>{String(toMinutes(Math.round(currentTime)))}</a>
                    <input
                        type={"range"}
                        onChange={(e) => {
                            changeTime(Number(e.target.value))
                        }}
                        style={{"--progress": `${currentTime / duration * 100}%`} as CSSProperties}
                        value={currentTime}
                        min={0}
                        max={duration || 0}
                        step={0.1}
                    />
                    <a>{String(toMinutes(Math.round(duration)))}</a>
                </div>
            </div>
        </div>
        <div id={"audio-right"}>
            <div id={"mute"} onClick={() => {
                toggleMute();
            }}>
                <FaVolumeXmark size={"3vh"}/>
            </div>
            <input type={"range"} value={volume} min={0} max={1} step={0.01} style={{
                "--volume": (muted ? 0 : volume),
                "--progress": `${muted ? 0 : volume * 100}%`
            } as CSSProperties} onChange={(e) => {
                changeVolume(Number(e.target.value));
            }}/>
            <div id={"louder"}>
                <FaVolumeHigh size={"3vh"}/>
            </div>
        </div>
    </div>;
}