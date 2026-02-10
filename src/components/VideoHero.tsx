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
        /* Direct mp4 */
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-[1] bg-black/40" />

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default VideoHero;
