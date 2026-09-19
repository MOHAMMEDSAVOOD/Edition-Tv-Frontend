"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Play, Pause, RotateCcw, RotateCw, X, Volume2 } from "lucide-react";

interface AudioPlayerBarProps {
  title: string;
  authorName?: string;
  subtitle?: string;
  bodyHtml?: string;
  summary?: string;
  audioUrl?: string;
  autoPlay?: boolean;
  onClose: () => void;
}

interface ChunkMeta {
  text: string;
  startSec: number;
  durationSec: number;
}

function buildChunkTimeline(title: string, subtitle?: string, bodyHtml?: string, summary?: string, rate: number = 1.0): { chunks: ChunkMeta[]; totalSeconds: number } {
  const rawChunks: string[] = [];

  if (title && title.trim()) {
    rawChunks.push(title.trim());
  }

  if (subtitle && subtitle.trim() && subtitle.trim() !== title.trim()) {
    rawChunks.push(subtitle.trim());
  }

  let rawBodyText = "";
  if (bodyHtml) {
    if (typeof window !== "undefined") {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = bodyHtml;
      const removeElements = tempDiv.querySelectorAll("script, style, iframe, figure, figcaption");
      removeElements.forEach((el) => el.remove());
      rawBodyText = tempDiv.textContent || tempDiv.innerText || "";
    } else {
      rawBodyText = bodyHtml.replace(/<[^>]*>?/gm, " ");
    }
  } else if (summary) {
    rawBodyText = summary;
  }

  if (rawBodyText) {
    const cleaned = rawBodyText.replace(/\s+/g, " ").trim();
    // Replaced lookbehind /(?<=[.?!])\s+/ which throws SyntaxErrors in older engines/Edge environments
    const splitTokens = cleaned.split(/([.?!]+)\s+/);
    const rawSentences: string[] = [];
    for (let i = 0; i < splitTokens.length; i += 2) {
      const text = splitTokens[i];
      const punc = splitTokens[i + 1] || "";
      if (text || punc) rawSentences.push(text + punc);
    }
    let currentChunk = "";
    for (const sentence of rawSentences) {
      const s = sentence.trim();
      if (!s) continue;

      if (!currentChunk) {
        currentChunk = s;
      } else if (currentChunk.length + s.length < 160) {
        currentChunk += " " + s;
      } else {
        rawChunks.push(currentChunk);
        currentChunk = s;
      }
    }

    if (currentChunk) {
      rawChunks.push(currentChunk);
    }
  }

  if (rawChunks.length === 0) {
    rawChunks.push(title);
  }

  // Calculate timestamps for each chunk (approx 140 words per min at 1.0x rate)
  const wordsPerSec = (140 / 60) * rate;
  let currentSec = 0;
  const chunks: ChunkMeta[] = rawChunks.map((text) => {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const duration = Math.max(1.5, wordCount / wordsPerSec);
    const start = currentSec;
    currentSec += duration;
    return { text, startSec: start, durationSec: duration };
  });

  return { chunks, totalSeconds: Math.max(10, Math.round(currentSec)) };
}

export function AudioPlayerBar({
  title,
  subtitle,
  bodyHtml,
  summary,
  audioUrl,
  autoPlay = true,
  onClose,
}: AudioPlayerBarProps) {
  const [useSpeechSynth, setUseSpeechSynth] = useState<boolean>(!audioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Audio element state for real audio URL
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(180);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Timeline
  const { chunks, totalSeconds } = useMemo(() => {
    return buildChunkTimeline(title, subtitle, bodyHtml, summary, playbackRate);
  }, [title, subtitle, bodyHtml, summary, playbackRate]);

  // Load natural browser voice
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const pickBestVoice = () => {
      try {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          const preferred =
            // 1. Try to find an Indian English female voice
            available.find(
              (v) =>
                v.lang.startsWith("en-IN") &&
                (v.name.toLowerCase().includes("female") ||
                  v.name.includes("Veena") ||
                  v.name.includes("Lekha") ||
                  v.name.includes("Google") || // Google's default en-IN is usually female
                  v.name.includes("Natural"))
            ) ||
            // 2. Fallback to any Indian English voice
            available.find((v) => v.lang.startsWith("en-IN")) ||
            // 3. Fallback to any natural English voice
            available.find(
              (v) =>
                v.lang.startsWith("en") &&
                (v.name.includes("Natural") ||
                  v.name.includes("Google") ||
                  v.name.includes("Samantha") ||
                  v.name.includes("Daniel") ||
                  v.name.includes("Siri"))
            ) ||
            // 4. Ultimate fallback to standard en-US
            available.find((v) => v.lang.startsWith("en-US")) ||
            available.find((v) => v.lang.startsWith("en")) ||
            available[0];

          setSelectedVoice(preferred || null);
        }
      } catch {
        // Fallback
      }
    };

    pickBestVoice();
    window.speechSynthesis.onvoiceschanged = pickBestVoice;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Speak a chunk
  const speakChunk = useCallback(
    (index: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();

      if (index >= chunks.length) {
        setIsPlaying(false);
        setCurrentChunkIndex(0);
        return;
      }

      setCurrentChunkIndex(index);
      const utterance = new SpeechSynthesisUtterance(chunks[index].text);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = playbackRate;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        if (index + 1 < chunks.length) {
          speakChunk(index + 1);
        } else {
          setIsPlaying(false);
          setCurrentChunkIndex(0);
        }
      };

      utterance.onerror = (e) => {
        if (e.error === "canceled" || e.error === "interrupted") return;
        setIsPlaying(false);
      };

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    },
    [chunks, selectedVoice, playbackRate]
  );

  // Play / Pause
  const togglePlay = () => {
    if (useSpeechSynth) {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        speakChunk(currentChunkIndex);
      }
    } else {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Jump 10 seconds backward or forward
  const seekDelta = (seconds: number) => {
    if (useSpeechSynth) {
      const currentSec = chunks[currentChunkIndex]?.startSec || 0;
      const targetSec = Math.max(0, Math.min(totalSeconds, currentSec + seconds));

      // Find closest chunk
      let bestIdx = 0;
      for (let i = 0; i < chunks.length; i++) {
        if (chunks[i].startSec <= targetSec) {
          bestIdx = i;
        } else {
          break;
        }
      }

      setCurrentChunkIndex(bestIdx);
      if (isPlaying) {
        speakChunk(bestIdx);
      }
    } else {
      if (!audioRef.current) return;
      audioRef.current.currentTime = Math.max(0, Math.min(audioDuration, audioRef.current.currentTime + seconds));
    }
  };

  // Click on progress bar to seek
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));

    if (useSpeechSynth) {
      const targetSec = percentage * totalSeconds;
      let bestIdx = 0;
      for (let i = 0; i < chunks.length; i++) {
        if (chunks[i].startSec <= targetSec) {
          bestIdx = i;
        } else {
          break;
        }
      }
      setCurrentChunkIndex(bestIdx);
      if (isPlaying) {
        speakChunk(bestIdx);
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = percentage * audioDuration;
    }
  };

  // Speed cycle: 1x -> 1.25x -> 1.5x -> 2x
  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const currentIdx = speeds.indexOf(playbackRate);
    const nextRate = speeds[(currentIdx + 1) % speeds.length];
    setPlaybackRate(nextRate);

    if (useSpeechSynth) {
      if (isPlaying) {
        speakChunk(currentChunkIndex);
      }
    } else if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  // Autoplay on mount
  useEffect(() => {
    if (autoPlay) {
      if (useSpeechSynth) {
        const timer = setTimeout(() => {
          speakChunk(0);
        }, 150);
        return () => clearTimeout(timer);
      } else if (audioRef.current) {
        audioRef.current.play().catch(() => {
          setUseSpeechSynth(true);
        });
        setIsPlaying(true);
      }
    }
  }, [autoPlay, useSpeechSynth, speakChunk]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const currentSeconds = useSpeechSynth
    ? Math.round(chunks[currentChunkIndex]?.startSec || 0)
    : Math.round(audioCurrentTime);

  const durationDisplay = useSpeechSynth ? totalSeconds : Math.round(audioDuration);
  const progressPercent = durationDisplay > 0 ? Math.min(100, (currentSeconds / durationDisplay) * 100) : 0;

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-3 right-3 sm:left-4 sm:right-4 md:left-auto md:right-8 md:w-[380px] bg-background/95 dark:bg-zinc-900/95 backdrop-blur-md border border-border rounded-xl p-3 sm:p-3.5 shadow-2xl z-50 text-xs font-sans animate-in slide-in-from-bottom-4 transition-all">
      {/* Audio Element (if audioUrl provided) */}
      {!useSpeechSynth && audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => setAudioCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration || 180)}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setUseSpeechSynth(true);
            speakChunk(0);
          }}
        />
      )}

      {/* Header: Audio Icon + Article Title + Close */}
      <div className="flex items-center justify-between gap-2.5 mb-2.5">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div className="h-6 w-6 rounded-md bg-red-600/10 text-red-600 dark:text-red-500 flex items-center justify-center shrink-0">
            {isPlaying ? (
              <div className="flex items-center gap-0.5 h-2.5 px-0.5">
                <span className="w-0.5 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="w-0.5 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-0.5 h-1.5 bg-red-600 rounded-full animate-pulse [animation-delay:300ms]" />
              </div>
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </div>
          <span className="font-semibold text-foreground truncate text-xs" title={title}>
            {title}
          </span>
        </div>

        <button
          onClick={() => {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
            if (audioRef.current) {
              audioRef.current.pause();
            }
            setIsPlaying(false);
            onClose();
          }}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors shrink-0"
          title="Close player"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Interactive Progress Bar */}
      <div
        ref={progressBarRef}
        onClick={handleProgressClick}
        className="w-full bg-muted h-1.5 rounded-full mb-3 cursor-pointer group relative overflow-hidden"
        title="Seek position"
      >
        <div
          className="bg-red-600 h-full rounded-full transition-all duration-150 group-hover:bg-red-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Controls Row: Time + 10s Back + Play/Pause + 10s Forward + Speed */}
      <div className="flex items-center justify-between gap-2">
        {/* Current Time / Total Duration */}
        <div className="font-mono text-[11px] text-muted-foreground tabular-nums shrink-0">
          <span>{formatTime(currentSeconds)}</span>
          <span className="mx-1 text-muted-foreground/60">/</span>
          <span>{formatTime(durationDisplay)}</span>
        </div>

        {/* Center Control Group: -10s, Play/Pause, +10s */}
        <div className="flex items-center gap-2">
          {/* 10s Rewind */}
          <button
            onClick={() => seekDelta(-10)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors relative"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold font-mono text-muted-foreground group-hover:text-foreground mt-0.5">
              10
            </span>
          </button>

          {/* Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-sm transition-transform active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>

          {/* 10s Forward */}
          <button
            onClick={() => seekDelta(10)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors relative"
            title="Forward 10 seconds"
          >
            <RotateCw className="h-4 w-4" />
            <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold font-mono text-muted-foreground group-hover:text-foreground mt-0.5">
              10
            </span>
          </button>
        </div>

        {/* Speed Control Pill */}
        <div className="shrink-0">
          <button
            onClick={cycleSpeed}
            className="px-2 py-0.5 bg-muted/80 hover:bg-muted border border-border/80 rounded text-[11px] font-mono font-bold text-foreground transition-colors"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
}
