"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, RotateCw, X, Volume2 } from "lucide-react";

interface AudioPlayerBarProps {
  title: string;
  authorName: string;
  audioUrl?: string;
  onClose: () => void;
}

export function AudioPlayerBar({ title, authorName, audioUrl, onClose }: AudioPlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // Default 3 min audio
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIdx]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-card/95 backdrop-blur-md border border-primary/40 rounded-lg p-3 shadow-2xl z-50 text-xs font-sans animate-in slide-in-from-bottom-5">
      <audio
        ref={audioRef}
        src={audioUrl || "https://actions.google.com/sounds/v1/speech/person_speaking.ogg"}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 180)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-7 w-7 rounded bg-primary/20 text-primary flex items-center justify-center flex-none">
            <Volume2 className="h-4 w-4" />
          </div>
          <div className="truncate">
            <span className="font-bold text-foreground block truncate text-xs">{title}</span>
            <span className="text-[10px] text-muted-foreground block">Audio Narration • {authorName}</span>
          </div>
        </div>

        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => handleSeek(-15)} className="p-1 text-muted-foreground hover:text-foreground" title="Rewind 15s">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={togglePlay}
            className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold hover:opacity-90 transition-opacity shadow-xs"
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
          </button>

          <button onClick={() => handleSeek(15)} className="p-1 text-muted-foreground hover:text-foreground" title="Forward 15s">
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          onClick={cycleSpeed}
          className="px-2 py-0.5 bg-muted border border-border rounded text-[10px] font-mono font-bold text-foreground hover:bg-background"
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
}
