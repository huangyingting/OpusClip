"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
} from "lucide-react";
import {
  buildWordsFromTranscript,
  type BrandTemplateConfig,
  DEFAULT_BRAND_TEMPLATES,
} from "@/lib/ai/clip-engine";

export interface ClipVideoPlayerProps {
  videoUrl: string;
  transcriptText: string;
  title?: string;
  durationMs?: number;
  templateConfig?: Partial<BrandTemplateConfig>;
  currentTimeSecExternal?: number;
  onTimeUpdateSec?: (sec: number) => void;
  compact?: boolean;
}

export function ClipVideoPlayer({
  videoUrl,
  transcriptText,
  title,
  durationMs = 45000,
  templateConfig,
  currentTimeSecExternal,
  onTimeUpdateSec,
  compact = false,
}: ClipVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(Math.max(10, Math.round(durationMs / 1000)));

  const cfg: BrandTemplateConfig = useMemo(
    () => ({
      ...DEFAULT_BRAND_TEMPLATES[0].config,
      ...(templateConfig || {}),
    }),
    [templateConfig]
  );

  const words = useMemo(
    () => buildWordsFromTranscript(transcriptText || "Viral short clip preview", duration),
    [transcriptText, duration]
  );

  useEffect(() => {
    if (
      typeof currentTimeSecExternal === "number" &&
      videoRef.current &&
      Math.abs(videoRef.current.currentTime - currentTimeSecExternal) > 0.35
    ) {
      videoRef.current.currentTime = currentTimeSecExternal % Math.max(1, videoRef.current.duration || 25);
      setCurrentTime(currentTimeSecExternal);
    }
  }, [currentTimeSecExternal]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  // Group words into chunks of 4 (1 line) or 7 (3 lines)
  const chunkSize = cfg.captionLines === "1" ? 3 : 6;
  const activeWordIdx = useMemo(() => {
    if (words.length === 0) return 0;
    const modTime = currentTime % Math.max(1, duration);
    const idx = words.findIndex((w) => modTime >= w.tr[0] && modTime <= w.tr[1]);
    if (idx !== -1) return idx;
    return Math.min(
      words.length - 1,
      Math.floor((modTime / Math.max(1, duration)) * words.length)
    );
  }, [words, currentTime, duration]);

  const activeChunk = useMemo(() => {
    const startIdx = Math.floor(activeWordIdx / chunkSize) * chunkSize;
    return words.slice(startIdx, startIdx + chunkSize).map((w, offset) => ({
      ...w,
      globalIdx: startIdx + offset,
    }));
  }, [words, activeWordIdx, chunkSize]);

  const aspectClass =
    cfg.aspectRatio === "1:1"
      ? "aspect-square max-w-[360px]"
      : cfg.aspectRatio === "16:9"
        ? "aspect-video max-w-[540px]"
        : "aspect-[9/16] max-w-[300px]";

  const captionPositionClass =
    cfg.captionPosition === "top"
      ? "top-14"
      : cfg.captionPosition === "middle"
        ? "top-1/2 -translate-y-1/2"
        : "bottom-14";

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div
      className={`relative w-full ${aspectClass} mx-auto rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800/90 shadow-2xl select-none group`}
    >
      {/* Top Preview Pill */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-semibold tracking-wider text-zinc-200 uppercase border border-white/10">
          LOW-RES PREVIEW
        </span>
        {cfg.autoBroll && (
          <span className="px-2 py-0.5 rounded bg-violet-600/80 backdrop-blur text-[10px] font-semibold text-white flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> AI B-Roll
          </span>
        )}
      </div>

      {/* Auto Headline Banner */}
      {cfg.autoHeadline && (cfg.headlineText || title) && (
        <div className="absolute top-10 inset-x-3 z-20 text-center pointer-events-none">
          <div className="inline-block px-3 py-1 rounded-lg bg-[#FFFD03] text-black font-black text-xs uppercase tracking-tight shadow-lg">
            {(cfg.headlineText || title || "VIRAL MOMENT").slice(0, 36)}
          </div>
        </div>
      )}

      {/* Video Surface (Fill / Fit / Split) */}
      {cfg.layoutMode === "split" ? (
        <div className="w-full h-full flex flex-col" onClick={togglePlay}>
          <div className="h-1/2 w-full overflow-hidden border-b border-zinc-800">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover scale-110"
              loop
              playsInline
              onTimeUpdate={(e) => {
                const t = e.currentTarget.currentTime;
                setCurrentTime(t);
                onTimeUpdateSec?.(t);
              }}
              onLoadedMetadata={(e) => {
                if (e.currentTarget.duration && Number.isFinite(e.currentTarget.duration)) {
                  setDuration(Math.max(10, Math.round(e.currentTarget.duration)));
                }
              }}
            />
          </div>
          <div className="h-1/2 w-full overflow-hidden bg-zinc-900 relative">
            <video
              src={videoUrl}
              muted
              playsInline
              className="w-full h-full object-cover object-right scale-125 opacity-90"
            />
            <span className="absolute bottom-2 right-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-zinc-300">
              Speaker 2 Track
            </span>
          </div>
        </div>
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${
            cfg.layoutMode === "fit" ? "bg-zinc-900 p-3" : ""
          }`}
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className={`w-full h-full ${
              cfg.layoutMode === "fit"
                ? "object-contain rounded-lg shadow-lg"
                : "object-cover"
            }`}
            loop
            playsInline
            onTimeUpdate={(e) => {
              const t = e.currentTarget.currentTime;
              setCurrentTime(t);
              onTimeUpdateSec?.(t);
            }}
            onLoadedMetadata={(e) => {
              if (e.currentTarget.duration && Number.isFinite(e.currentTarget.duration)) {
                setDuration(Math.max(10, Math.round(e.currentTarget.duration)));
              }
            }}
          />
        </div>
      )}

      {/* Animated Karaoke Caption Overlay */}
      <div
        className={`absolute inset-x-3 ${captionPositionClass} z-20 text-center pointer-events-none transition-all duration-150`}
      >
        <div className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 px-3 py-1.5 rounded-xl bg-black/55 backdrop-blur-sm">
          {activeChunk.map((w) => {
            const isCurrent = w.globalIdx === activeWordIdx;
            const textDisplay = cfg.uppercase ? w.text.toUpperCase() : w.text;
            let color = cfg.fontColor || "#FFFFFF";
            if (isCurrent) {
              color = cfg.highlightPrimary || "#04F827";
            } else if (w.highlight === "secondary") {
              color = cfg.highlightSecondary || "#FFFD03";
            }

            return (
              <span
                key={w.globalIdx}
                style={{
                  color,
                  fontFamily: cfg.fontFamily || "Montserrat, sans-serif",
                  textShadow: "0 2px 6px rgba(0,0,0,0.95), 0 0 2px #000",
                }}
                className={`font-black tracking-tight transition-transform duration-100 ${
                  compact ? "text-sm" : "text-base md:text-lg"
                } ${isCurrent ? "scale-110" : "scale-100"}`}
              >
                {textDisplay}
              </span>
            );
          })}
          {cfg.aiEmojis && activeWordIdx % 5 === 0 && (
            <span className="text-base ml-0.5">🔥</span>
          )}
        </div>
      </div>

      {/* Bottom Transport Controls */}
      <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6 pb-2.5 px-3 flex flex-col gap-1.5">
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={Math.min(duration, currentTime)}
          aria-label="Seek clip timeline"
          onChange={(e) => {
            const next = parseFloat(e.target.value);
            setCurrentTime(next);
            if (videoRef.current) {
              videoRef.current.currentTime = next;
            }
            onTimeUpdateSec?.(next);
          }}
          className="w-full h-1 accent-[#04F827] bg-zinc-700 rounded-lg cursor-pointer"
        />
        <div className="flex items-center justify-between text-[11px] text-zinc-300 font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause clip" : "Play clip"}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <span>{formatSec(currentTime)}</span>
            <span className="text-zinc-500">/</span>
            <span>{formatSec(duration)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="p-1 rounded-md hover:bg-white/10 text-zinc-300"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <Maximize2 className="w-3 h-3 text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
