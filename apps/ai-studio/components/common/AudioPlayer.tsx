"use client";

import React, { useState } from "react";
import { Play, Pause, Volume2, RotateCcw, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AudioPlayerProps {
  title: string;
  duration?: string;
}

export function AudioPlayer({ title, duration = "4 min" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState("1.0x");

  const togglePlaybackRate = () => {
    if (playbackRate === "1.0x") setPlaybackRate("1.25x");
    else if (playbackRate === "1.25x") setPlaybackRate("1.5x");
    else if (playbackRate === "1.5x") setPlaybackRate("2.0x");
    else setPlaybackRate("1.0x");
  };

  return (
    <Card className="border-indigo-500/20 bg-indigo-950/10 backdrop-blur">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="editorial"
            size="icon"
            className="h-10 w-10 rounded-full shrink-0 shadow-md"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause article audio" : "Listen to article audio"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>
          <div className="space-y-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Listen to Article • {duration}
            </span>
            <p className="text-sm font-medium line-clamp-1">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-mono h-8 px-2"
            onClick={togglePlaybackRate}
          >
            {playbackRate}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsPlaying(false)}
            aria-label="Restart audio"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
