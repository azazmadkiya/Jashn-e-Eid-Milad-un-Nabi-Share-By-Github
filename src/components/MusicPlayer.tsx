import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Disc,
  ListMusic,
  ChevronUp,
  ChevronDown,
  Radio,
  Repeat,
  Repeat1,
  Shuffle,
  Sparkles,
  Music2,
  RefreshCw,
  ListFilter,
  Link2,
  Check
} from 'lucide-react';
import { TRACKS, DEFAULT_PLAYLIST_ID, DEFAULT_PLAYLIST_NAME } from '../data/miladData';
import { soundManager } from '../utils/soundEffects';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const MusicPlayer: React.FC = () => {
  // Player state
  const [playMode, setPlayMode] = useState<'track' | 'playlist'>('playlist');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlistId, setPlaylistId] = useState(DEFAULT_PLAYLIST_ID);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(85);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatMode, setRepeatMode] = useState<'all' | 'one' | 'shuffle'>('all');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to play');
  const [ytReady, setYtReady] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState(DEFAULT_PLAYLIST_NAME);

  const ytPlayerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerId = useRef(`yt-audio-frame-${Math.random().toString(36).substring(2, 9)}`);

  const currentTrack = TRACKS[currentTrackIndex] || TRACKS[0];

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setYtReady(true);
      return;
    }

    const existingScript = document.getElementById('youtube-iframe-api');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      setYtReady(true);
    };
  }, []);

  // Initialize YouTube Player
  useEffect(() => {
    if (!ytReady) return;

    try {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
      }

      const playerConfig: any = {
        height: '200',
        width: '200',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            ytPlayerRef.current = event.target;
            ytPlayerRef.current.setVolume(volume);
            if (isMuted) ytPlayerRef.current.mute();
            setStatusMessage('Audio engine ready');
          },
          onStateChange: (event: any) => {
            const YT = window.YT;
            if (!YT) return;

            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setIsLoading(false);
              setStatusMessage('Playing Naat');
              try {
                const dur = ytPlayerRef.current?.getDuration() || 0;
                setDuration(dur);
              } catch {}
            } else if (event.data === YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              setIsLoading(false);
              setStatusMessage('Paused');
            } else if (event.data === YT.PlayerState.BUFFERING) {
              setIsLoading(true);
              setStatusMessage('Buffering audio...');
            } else if (event.data === YT.PlayerState.ENDED) {
              handleAudioEnded();
            }
          },
          onError: (e: any) => {
            setIsLoading(false);
            setIsPlaying(false);
            setStatusMessage('Audio unavailable. Switching track...');
            // Auto advance on unplayable track
            setTimeout(() => {
              handleNext();
            }, 1200);
          }
        }
      };

      if (playMode === 'playlist') {
        playerConfig.playerVars.listType = 'playlist';
        playerConfig.playerVars.list = playlistId;
      } else {
        playerConfig.videoId = currentTrack.youtubeId || 'A-K4-R1-29E';
      }

      new window.YT.Player(containerId.current, playerConfig);
    } catch (err) {
      console.warn('YouTube Player init error:', err);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ytReady]);

  // Synchronize timer polling for smooth scrubber updates
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          try {
            const cur = ytPlayerRef.current.getCurrentTime() || 0;
            const dur = ytPlayerRef.current.getDuration() || 0;
            setCurrentTime(cur);
            if (dur > 0 && dur !== duration) {
              setDuration(dur);
            }
          } catch {}
        }
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration]);

  const handleAudioEnded = () => {
    if (repeatMode === 'one') {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(0, true);
        ytPlayerRef.current.playVideo();
      }
    } else {
      handleNext();
    }
  };

  const togglePlay = () => {
    soundManager.playCassetteClick();
    if (!ytPlayerRef.current) {
      setStatusMessage('Initializing audio...');
      return;
    }

    if (isPlaying) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {
        setIsPlaying(false);
      }
    } else {
      setIsLoading(true);
      setStatusMessage('Connecting audio stream...');
      try {
        ytPlayerRef.current.playVideo();
      } catch (err) {
        setIsLoading(false);
      }
    }
  };

  const handleNext = () => {
    soundManager.playCassetteClick();
    if (!ytPlayerRef.current) return;

    if (playMode === 'playlist') {
      try {
        if (repeatMode === 'shuffle') {
          ytPlayerRef.current.setShuffle(true);
        }
        ytPlayerRef.current.nextVideo();
        setIsPlaying(true);
      } catch {
        // Fallback
        switchToTrackMode((currentTrackIndex + 1) % TRACKS.length);
      }
    } else {
      const nextIdx = repeatMode === 'shuffle'
        ? Math.floor(Math.random() * TRACKS.length)
        : (currentTrackIndex + 1) % TRACKS.length;
      playSpecificTrack(nextIdx);
    }
  };

  const handlePrev = () => {
    soundManager.playCassetteClick();
    if (!ytPlayerRef.current) return;

    if (currentTime > 3) {
      try {
        ytPlayerRef.current.seekTo(0, true);
        return;
      } catch {}
    }

    if (playMode === 'playlist') {
      try {
        ytPlayerRef.current.previousVideo();
        setIsPlaying(true);
      } catch {
        switchToTrackMode((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length);
      }
    } else {
      const prevIdx = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
      playSpecificTrack(prevIdx);
    }
  };

  const playSpecificTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setPlayMode('track');
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);

    const track = TRACKS[index];
    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById(track.youtubeId || 'A-K4-R1-29E');
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      } catch (e) {
        setIsLoading(false);
      }
    }
  };

  const switchToPlaylistMode = (plId?: string) => {
    soundManager.playCassetteClick();
    const targetPlaylist = plId || playlistId || DEFAULT_PLAYLIST_ID;
    setPlaylistId(targetPlaylist);
    setPlayMode('playlist');
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setShowPlaylist(false);

    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadPlaylist === 'function') {
      try {
        ytPlayerRef.current.loadPlaylist({
          list: targetPlaylist,
          listType: 'playlist',
          index: 0
        });
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      } catch {
        setIsLoading(false);
      }
    }
  };

  const switchToTrackMode = (index: number) => {
    soundManager.playCassetteClick();
    playSpecificTrack(index);
    setShowPlaylist(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        ytPlayerRef.current.setVolume(val);
        if (val > 0 && isMuted) {
          ytPlayerRef.current.unMute();
        }
      } catch {}
    }
  };

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    if (ytPlayerRef.current) {
      try {
        if (newMute) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(volume || 85);
        }
      } catch {}
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(seekTime, true);
      } catch {}
    }
  };

  const toggleRepeatMode = () => {
    if (repeatMode === 'all') setRepeatMode('one');
    else if (repeatMode === 'one') setRepeatMode('shuffle');
    else setRepeatMode('all');
  };

  // Helper to extract playlist / video ID from custom URL
  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    let input = customUrlInput.trim();
    let extractedPlaylistId = '';
    let extractedVideoId = '';

    // Check for list parameter
    if (input.includes('list=')) {
      const match = input.match(/[?&]list=([^#&?]+)/);
      if (match && match[1]) {
        extractedPlaylistId = match[1];
      }
    } else if (input.startsWith('PL') || input.startsWith('RD') || input.startsWith('UL')) {
      extractedPlaylistId = input;
    } else {
      // Check for video id
      const videoMatch = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (videoMatch && videoMatch[1]) {
        extractedVideoId = videoMatch[1];
      } else if (input.length === 11) {
        extractedVideoId = input;
      }
    }

    if (extractedPlaylistId) {
      setPlaylistId(extractedPlaylistId);
      setPlaylistTitle('Custom YouTube Playlist');
      switchToPlaylistMode(extractedPlaylistId);
      setShowUrlInput(false);
      setCustomUrlInput('');
    } else if (extractedVideoId) {
      setPlayMode('track');
      if (ytPlayerRef.current) {
        ytPlayerRef.current.loadVideoById(extractedVideoId);
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
      setShowUrlInput(false);
      setCustomUrlInput('');
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const displayTitle = playMode === 'playlist' ? playlistTitle : currentTrack.title;
  const displaySubtitle = playMode === 'playlist' ? 'Continuous Rabi-ul-Awwal Audio Mehfil' : currentTrack.reciter;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 pointer-events-none">
      
      {/* Hidden YouTube IFrame Container - purely serves audio */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '200px',
          height: '200px',
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: -1,
          overflow: 'hidden'
        }}
      >
        <div id={containerId.current} />
      </div>

      <div className="max-w-3xl mx-auto pointer-events-auto">
        
        {/* Playlist / Custom URL Selection Drawer */}
        {showPlaylist && (
          <div className="mb-2 bg-[#021810]/98 border border-amber-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl max-h-80 overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-emerald-800/50">
              <span className="font-mono text-xs uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                <ListMusic className="w-4 h-4 text-amber-400" />
                Naat Mehfil & Playlists
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Play custom YouTube playlist / video link"
                >
                  <Link2 className="w-3 h-3" />
                  Custom Link
                </button>
                <button
                  onClick={() => setShowPlaylist(false)}
                  className="text-emerald-300 hover:text-amber-300 text-xs font-mono px-2 py-0.5 rounded-lg bg-emerald-950 border border-emerald-500/20 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Custom URL Input Bar */}
            {showUrlInput && (
              <form onSubmit={handleApplyCustomUrl} className="mb-3 p-2 bg-emerald-950/80 rounded-xl border border-amber-500/30 flex gap-2">
                <input
                  type="text"
                  placeholder="Paste YouTube Playlist link or Video URL..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 bg-[#01140d] text-emerald-100 placeholder-emerald-500/60 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-800 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-400 text-emerald-950 text-xs font-bold font-mono rounded-lg hover:bg-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Play
                </button>
              </form>
            )}

            {/* 1. Official Continuous YouTube Playlist Option */}
            <div className="mb-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80 px-1 mb-1 font-bold">
                Continuous Audio Playlists
              </p>
              <button
                onClick={() => switchToPlaylistMode(DEFAULT_PLAYLIST_ID)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  playMode === 'playlist'
                    ? 'bg-gradient-to-r from-amber-500/25 to-emerald-800/40 border border-amber-400/60 text-amber-200 shadow-md'
                    : 'hover:bg-emerald-900/40 text-emerald-200/90 border border-emerald-800/40 bg-emerald-950/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-mono text-xs font-bold ${playMode === 'playlist' ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-900 text-emerald-300'}`}>
                    {playMode === 'playlist' && isPlaying ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-950 animate-ping" />
                    ) : (
                      <Radio className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold font-title leading-tight text-amber-200 truncate">
                      {DEFAULT_PLAYLIST_NAME}
                    </p>
                    <p className="text-[10px] text-emerald-300/80 font-serif truncate">
                      Official Continuous Naat Audio Stream (YouTube Playlist)
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 text-amber-300 shrink-0 border border-amber-500/30">
                  Full Mehfil
                </span>
              </button>
            </div>

            {/* 2. Individual Famous Naat Tracks */}
            <div className="space-y-1 mt-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80 px-1 mb-1 font-bold">
                Individual Vintage Naat Tracks ({TRACKS.length})
              </p>
              {TRACKS.map((track, idx) => {
                const isSelected = playMode === 'track' && idx === currentTrackIndex;
                return (
                  <button
                    key={track.id}
                    onClick={() => switchToTrackMode(idx)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border border-amber-400/50 text-amber-200 shadow-sm'
                        : 'hover:bg-emerald-900/40 text-emerald-200/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-mono text-[11px] font-bold ${isSelected ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-900 text-emerald-300'}`}>
                        {isSelected && isPlaying ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-950 animate-ping" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold font-title leading-tight truncate ${isSelected ? 'text-amber-200' : 'text-emerald-100'}`}>
                          {track.title}
                        </p>
                        <p className="text-[10px] text-emerald-300/70 font-serif truncate">
                          {track.reciter}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400/80 shrink-0">
                      {track.duration || 'Audio'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating MP3 Style Player Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#022116] to-emerald-950 border border-amber-500/50 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          {/* Top Progress Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            
            {/* Track Info & Vintage Spinning Disc */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-400/80 bg-emerald-950 flex items-center justify-center shrink-0 shadow-md relative ${isPlaying ? 'animate-spin' : ''}`}
                style={{ animationDuration: '6s' }}
              >
                <Disc className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                <div className="absolute w-2 h-2 bg-[#021810] rounded-full border border-amber-400" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-amber-300 font-semibold flex items-center gap-1">
                    <Radio className={`w-2.5 h-2.5 ${isPlaying ? 'animate-pulse text-amber-400' : 'text-emerald-500'}`} />
                    <span>{playMode === 'playlist' ? 'YouTube Playlist Audio' : 'Naat Audio'}</span>
                  </span>

                  {/* Equalizer frequency animation when playing */}
                  {isPlaying && (
                    <div className="flex items-end gap-0.5 h-2.5">
                      <span className="w-0.5 bg-amber-400 h-2 animate-pulse" />
                      <span className="w-0.5 bg-emerald-400 h-3 animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 bg-amber-300 h-1.5 animate-pulse" style={{ animationDelay: '300ms' }} />
                      <span className="w-0.5 bg-emerald-300 h-2.5 animate-pulse" style={{ animationDelay: '450ms' }} />
                    </div>
                  )}
                </div>

                <h4 className="font-title text-xs sm:text-sm font-bold text-amber-200 truncate">
                  {displayTitle}
                </h4>
                <p className="text-[10px] text-emerald-300/70 font-serif truncate">
                  {displaySubtitle}
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              
              {/* Previous */}
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 hover:text-amber-300 transition-all active:scale-95 cursor-pointer"
                title="Previous Audio"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                disabled={isLoading && !ytReady}
                className="p-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-emerald-950 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all font-bold cursor-pointer disabled:opacity-75"
                title={isPlaying ? 'Pause Audio' : 'Play Naat Audio'}
              >
                {isLoading ? (
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-950" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 hover:text-amber-300 transition-all active:scale-95 cursor-pointer"
                title="Next Audio"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {/* Playback Repeat/Shuffle Mode */}
              <button
                onClick={toggleRepeatMode}
                className="p-1.5 rounded-lg bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 hover:text-amber-300 transition-all cursor-pointer hidden xs:flex items-center justify-center"
                title={`Playback Mode: ${repeatMode}`}
              >
                {repeatMode === 'all' && <Repeat className="w-3.5 h-3.5" />}
                {repeatMode === 'one' && <Repeat1 className="w-3.5 h-3.5 text-amber-300" />}
                {repeatMode === 'shuffle' && <Shuffle className="w-3.5 h-3.5 text-amber-300" />}
              </button>

              {/* Toggle Playlist Menu */}
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  showPlaylist
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                    : 'bg-emerald-900/60 border-emerald-500/30 text-emerald-300 hover:text-amber-300'
                }`}
                title="Open Playlist Drawer"
              >
                <ListMusic className="w-3.5 h-3.5" />
              </button>

              {/* Expand Seeker & Volume Drawer */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg bg-emerald-900/40 border border-emerald-500/20 text-emerald-300 hover:text-amber-300 transition-all cursor-pointer"
                title={isExpanded ? 'Collapse' : 'Audio Controls & Scrubber'}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Time Scrubber & Audio Controls Drawer */}
          {isExpanded && (
            <div className="mt-2.5 pt-2.5 border-t border-emerald-800/60 space-y-2">
              
              {/* Seek Bar */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-amber-300/80 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 accent-amber-400 h-1.5 bg-emerald-900/80 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono text-emerald-300/80 w-10">
                  {duration > 0 ? formatTime(duration) : '--:--'}
                </span>
              </div>

              {/* Volume & Quick Playlist Switch */}
              <div className="flex items-center justify-between gap-4 pt-1 flex-wrap sm:flex-nowrap">
                
                {/* Volume Slider */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-emerald-300 hover:text-amber-300 transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-300" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 sm:w-28 accent-amber-400 h-1 bg-emerald-900/80 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-emerald-300/80">
                    {isMuted ? '0%' : `${volume}%`}
                  </span>
                </div>

                {/* Status & Mode Switch */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-amber-300/80">
                  <span className="truncate max-w-[150px] sm:max-w-[200px] text-emerald-300/70">
                    {statusMessage}
                  </span>

                  {playMode === 'playlist' ? (
                    <button
                      onClick={() => switchToTrackMode(0)}
                      className="px-2 py-0.5 rounded bg-emerald-900/80 border border-emerald-500/30 text-amber-300 hover:bg-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ListFilter className="w-3 h-3" />
                      Single Tracks
                    </button>
                  ) : (
                    <button
                      onClick={() => switchToPlaylistMode()}
                      className="px-2 py-0.5 rounded bg-emerald-900/80 border border-emerald-500/30 text-amber-300 hover:bg-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Radio className="w-3 h-3 text-amber-400" />
                      Full Playlist
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
