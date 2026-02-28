import "./Audio.css";
import {type CSSProperties, useEffect, useRef, useState} from "react";
import {FaRadio, FaVolumeHigh, FaVolumeXmark} from "react-icons/fa6";
import {
    TbPlayerPauseFilled,
    TbPlayerPlayFilled,
    TbPlayerSkipBackFilled,
    TbPlayerSkipForwardFilled
} from "react-icons/tb";
import {useMusic, useNowPlaying} from "../../providers/MusicProvider.tsx";

function toMinutes(seconds: number): string {
    let hours = 0;
    let minutes = 0;
    while (seconds >= 60) {
        minutes++;
        seconds -= 60;
    }
    while (minutes >= 60) {
        hours++;
        minutes -= 60;
    }

    return (hours > 0 ? (hours < 10 ? "0" : "") + String(hours) + ":" : "") + (minutes < 10 ? "0" : "") + String(minutes) + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function SineWave() {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);

    const height = 80;
    const amplitude = 20;
    const periods = 24;
    const points = 300;

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            setWidth(entry.contentRect.width);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    function generatePath(w: number) {
        const pts = [];
        const totalWidth = w * 2;
        for (let i = 0; i <= points; i++) {
            const x = (i / points) * totalWidth;
            const y = height / 2 + (amplitude) * Math.sin((i / points) * periods * 2 * Math.PI);
            pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
        }
        return pts.join(' ');
    }

    return (
        <div ref={containerRef} id={"sine"} style={{overflow: 'hidden', position: 'relative'}}>
            {width > 0 && (
                <svg
                    viewBox={`0 0 ${width * 2} ${height}`}
                    preserveAspectRatio="none"
                >
                    <path
                          d={generatePath(width)}/>
                </svg>
            )}
        </div>
    );
}

export default function Audio() {
    const audio = useRef<HTMLAudioElement | null>(null);
    const {player, page, db} = useMusic();
    const nowPlaying = useNowPlaying(player.isRadio() ? player.asRadio()?.url.track : undefined);

    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [paused, setPaused] = useState(false);
    const [volume, setVolume] = useState(0);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        const el = audio.current;
        if (!el || !player.playing) return;

        el.src = player.playing.url.track;
        el.load();

        function setTime() {
            setCurrentTime(0);
        }

        setTime();

        if (player.hasInteracted) {
            el.play().catch(console.error);

            function unpause() {
                setPaused(false);
            }

            unpause();
        }
    }, [player.hasInteracted, player.playing]);

    useEffect(() => {
        const el = audio.current;
        if (!el) return;

        const onLoadedMetadata = () => {
            const d = Number.isFinite(el.duration) ? el.duration : 0;
            setDuration(Math.round(d));
            setPaused(el.paused);
            setVolume(el.volume);
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

            if (player.queue.length > 0) {
                player.forward();
            } else {
                const pool = page?.songs ?? db;
                const song = pool[Math.round(Math.random() * (pool.length - 1))];
                player.play(song);
            }
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
    }, [db, page?.songs, player.play, player.forward, player.queue.length, player.playing, player]);

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
        player.interact();
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

    return <div id="audio-controller" className={!player.playing ? "no-song" : ""}>
        <div id={"audio-left"}>
            <div id={"cover"}>
                {player.playing ? (player.isSong() ?
                    <img src={player.playing?.url.cover} alt={player.playing?.title}/> :
                    (player.asRadio().url.cover.length > 0 ?  <img src={player.asRadio().url.cover} alt={player.playing?.title}/> : <FaRadio className={"icon"} size={"6vh"}/>)) : ""}
            </div>
            <div id={"info"}>
                <h3>{player.playing ? (player.isSong() ? player.asSong().title : (nowPlaying ? nowPlaying : player.playing?.title)) : ""}</h3>
                <h5>{player.playing ? (player.isSong() ? player.asSong()?.artist.name : player.asRadio()?.title) : ""}</h5>
            </div>
        </div>
        <div id={"audio-middle"}>
            <audio ref={audio} controls/>
            <div id="controls">
                <div id={"top"}>
                    <div id={"prev"} className={player.history.length <= 0 ? "disabled" : "enabled"} onClick={() => {
                        player.back();
                    }}><TbPlayerSkipBackFilled className={"icon"}/></div>
                    <div id={"play"} className={(!player.playing && player.queue.length <= 0) ? "disabled" : "enabled"}
                         onClick={() => {
                             if (player.playing) {
                                 toggle();
                             } else if (!player.playing && player.queue.length > 0) {
                                 player.forward();
                             }
                         }}>{!paused ? <TbPlayerPauseFilled className={"icon"}/> :
                        <TbPlayerPlayFilled className={"icon"}/>}</div>
                    <div id={"next"} className={player.queue.length <= 0 ? "disabled" : "enabled"}>
                        <TbPlayerSkipForwardFilled className={"icon"} onClick={() => {
                        player.forward();
                    }}/></div>
                </div>
                <div id={"bottom"}>
                    <a>{String(toMinutes(Math.round(currentTime)))}</a>
                    {player.isRadio() ? <SineWave/> : <input
                        type={"range"}
                        onChange={(e) => {
                            changeTime(Number(e.target.value))
                        }}
                        style={{"--progress": `${currentTime / duration * 100}%`} as CSSProperties}
                        value={currentTime}
                        min={0}
                        max={duration || 0}
                        step={0.1}
                    />}
                    <a>{String(toMinutes(Math.round(duration)))}</a>
                </div>
            </div>
        </div>
        <div id={"audio-right"}>
            <div id={"volume"}>
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

        </div>
    </div>;
}