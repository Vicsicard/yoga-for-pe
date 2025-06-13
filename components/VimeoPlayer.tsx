'use client';

import { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';

interface VimeoPlayerProps {
  videoId: string;
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  responsive?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onTimeUpdate?: (data: { seconds: number; percent: number; duration: number }) => void;
  className?: string;
}

export default function VimeoPlayer({
  videoId,
  width = '100%',
  height = 'auto',
  autoplay = false,
  loop = false,
  muted = false,
  responsive = true,
  onPlay,
  onPause,
  onEnd,
  onTimeUpdate,
  className = '',
}: VimeoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only initialize the player on the client side
    if (!containerRef.current) return;

    const vimeoPlayer = new Player(containerRef.current, {
      id: videoId,
      width: responsive ? '100%' : width,
      height: responsive ? 'auto' : height,
      autoplay,
      loop,
      muted,
      responsive,
    });

    setPlayer(vimeoPlayer);

    // Set up event listeners
    vimeoPlayer.on('loaded', () => {
      setIsLoaded(true);
    });

    if (onPlay) vimeoPlayer.on('play', onPlay);
    if (onPause) vimeoPlayer.on('pause', onPause);
    if (onEnd) vimeoPlayer.on('ended', onEnd);
    if (onTimeUpdate) vimeoPlayer.on('timeupdate', onTimeUpdate);

    // Clean up
    return () => {
      vimeoPlayer.destroy();
    };
  }, [videoId, width, height, autoplay, loop, muted, responsive, onPlay, onPause, onEnd, onTimeUpdate]);

  return (
    <div 
      className={`vimeo-player-container ${className}`} 
      style={{ width: responsive ? '100%' : width, aspectRatio: responsive ? '16/9' : 'auto' }}
    >
      <div ref={containerRef} />
    </div>
  );
}
