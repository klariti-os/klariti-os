"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";

interface VideoHeroProps {
  /** Vimeo video ID or direct mp4 URL */
  src: string;
  /** Poster image shown instantly while video loads */
  poster?: string;
  /** Playback speed multiplier (e.g. 1.5, 2). Default: 1 */
  speed?: number;
  /** Content rendered on top of the video */
  children: React.ReactNode;
}

/** Extract a Vimeo ID and optional #t= timestamp from various URL formats */
function parseVimeoSrc(src: string): { id: string; startTime: string } | null {
  const match = src.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (!match) return null;
  const hashMatch = src.match(/#t=([\w]+)/);
  return { id: match[1], startTime: hashMatch ? hashMatch[1] : "" };
}

const VideoHero: React.FC<VideoHeroProps> = ({ src, poster, speed = 1, children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const vimeo = parseVimeoSrc(src);
  const [videoReady, setVideoReady] = useState(false);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);

    if (vimeo && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ method: "setVolume", value: next ? 0 : 1 }),
        "*"
      );
    } else if (videoRef.current) {
      videoRef.current.muted = next;
    }
  };

  useEffect(() => {
    if (!vimeo && videoRef.current) {
      videoRef.current.playbackRate = speed;
      videoRef.current.play().catch(() => {});
    }
  }, [vimeo, speed]);

  // For Vimeo, fade in the iframe after a short delay to let it buffer
  // and set playback speed via postMessage API
  useEffect(() => {
    if (vimeo) {
      const timer = setTimeout(() => {
        setVideoReady(true);
        // Set playback speed via Vimeo Player postMessage API
        if (iframeRef.current?.contentWindow && speed !== 1) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ method: "setPlaybackRate", value: speed }),
            "*"
          );
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [vimeo, speed]);

  // Build the Vimeo embed URL with start time
  const vimeoEmbedUrl = vimeo
    ? `https://player.vimeo.com/video/${vimeo.id}?background=1&autoplay=1&loop=1&muted=1&quality=1080p${vimeo.startTime ? `#t=${vimeo.startTime}` : ""}`
    : "";

  return (
    <div className="relative h-screen w-full overflow-hidden rounded-3xl border-8 border-white">
      {/* Poster image — shows instantly, sits behind the video */}
      {poster && (
        <Image
          src={poster}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}

      {vimeo ? (
        /* Vimeo Background Embed — fades in over the poster */
        <iframe
          ref={iframeRef}
          src={vimeoEmbedUrl}
          className={`pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-1000 ${videoReady ? "opacity-100" : "opacity-0"}`}
          allow="autoplay; fullscreen"
          title="Background video"
        />
      ) : (
        /* Direct video file */
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
        >
          <source src={src} type={src.endsWith(".mov") ? "video/quicktime" : "video/mp4"} />
        </video>
      )}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-[1] bg-black/40" />

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {children}
      </div>

      {/* Mute / Unmute button */}
      <button
        onClick={toggleMute}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-6 right-6 z-20 inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
      >
        {muted ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v17.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v17.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default VideoHero;
