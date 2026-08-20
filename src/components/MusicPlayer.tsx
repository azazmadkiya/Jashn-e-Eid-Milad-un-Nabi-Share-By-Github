import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { TRACKS } from '../data/miladData';
import { Track } from '../types';
import { soundManager } from '../utils/soundEffects';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const MusicPlayer: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackMode, setPlaybackMode] = useState<'repeat-all' | 'repeat-one' | 'shuffle'>('repeat-all');
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack: Track = TRACKS[currentTrackIndex] || TRACKS[0];

  // Configure MediaSession for background audio if supported
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'mediaSession' in navigator && 'MediaMetadata' in window) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.reciter,
          album: 'Jashn-E-Eid Milad-Un-Nabi',
        });
      }
    } catch {}
  }, [currentTrack]);

  const togglePlay = () => {
    soundManager.playCassetteClick();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setHasError(false);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
          });
      }
    }
  };

  const handleNext = () => {
    soundManager.playCassetteClick();
    setHasError(false);
    if (playbackMode === 'shuffle') {
      const randomIdx = Math.floor(Math.random() * TRACKS.length);
      setCurrentTrackIndex(randomIdx);
    } else {
      const nextIdx = (currentTrackIndex + 1) % TRACKS.length;
      setCurrentTrackIndex(nextIdx);
    }
    setIsPlaying(true);
  };

  const handlePrev = () => {
    soundManager.playCassetteClick();
    setHasError(false);
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prevIdx = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrackIndex(prevIdx);
    setIsPlaying(true);
  };

  const handleTrackSelect = (index: number) => {
    soundManager.playCassetteClick();
    setHasError(false);
    setCurrentTrackIndex(index);
    setShowPlaylist(false);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    if (audioRef.current) {
      audioRef.current.volume = newMute ? 0 : volume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const togglePlaybackMode = () => {
    if (playbackMode === 'repeat-all') setPlaybackMode('repeat-one');
    else if (playbackMode === 'repeat-one') setPlaybackMode('shuffle');
    else setPlaybackMode('repeat-all');
  };

  const handleEnded = () => {
    if (playbackMode === 'repeat-one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    } else {
      handleNext();
    }
  };

  // Switch audio source cleanly when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack.audioUrl) {
      setHasError(false);
      setCurrentTime(0);
      setDuration(0);
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        setIsLoading(true);
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
          });
      }
    }
  }, [currentTrackIndex]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 pointer-events-none">
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl || ''}
        preload="metadata"
        playsInline={true}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onEnded={handleEnded}
        onError={() => {
          setIsPlaying(false);
          setIsLoading(false);
          setHasError(true);
        }}
      />

      <div className="max-w-3xl mx-auto pointer-events-auto">
        
        {/* Playlist Tracks Selector Drawer */}
        {showPlaylist && (
          <div className="mb-2 bg-[#021810]/98 border border-amber-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-800/50">
              <span className="font-mono text-xs uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                <ListMusic className="w-4 h-4 text-amber-400" />
                Naat MP3 Playlist ({TRACKS.length} Tracks)
              </span>
              <button
                onClick={() => setShowPlaylist(false)}
                className="text-emerald-300 hover:text-amber-300 text-xs font-mono px-2 py-0.5 rounded-lg bg-emerald-950 border border-emerald-500/20 cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-1">
              {TRACKS.map((track, idx) => {
                const isSelected = idx === currentTrackIndex;
                return (
                  <button
                    key={track.id}
                    onClick={() => handleTrackSelect(idx)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border border-amber-400/50 text-amber-200 shadow-sm'
                        : 'hover:bg-emerald-900/40 text-emerald-200/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-mono text-xs font-bold ${isSelected ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-900 text-emerald-300'}`}>
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
                      {track.duration || 'MP3'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating MP3 Player Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#022116] to-emerald-950 border border-amber-500/50 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          {/* Top subtle progress line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            
            {/* Track Info & Vinyl Icon */}
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
                    <Radio className="w-2.5 h-2.5 animate-pulse text-amber-400" />
                    <span>MP3 Audio Player</span>
                  </span>
                  {hasError && (
                    <span className="text-[9px] text-rose-400 flex items-center gap-0.5 font-mono">
                      <AlertCircle className="w-2.5 h-2.5" /> Error loading audio
                    </span>
                  )}
                </div>
                <h4 className="font-title text-xs sm:text-sm font-bold text-amber-200 truncate">
                  {currentTrack.title}
                </h4>
                <p className="text-[10px] text-emerald-300/70 font-serif truncate">
                  {currentTrack.reciter}
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Previous */}
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 hover:text-amber-300 transition-all active:scale-95 cursor-pointer"
                title="Previous Track"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="p-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-emerald-950 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all font-bold cursor-pointer disabled:opacity-75"
                title={isPlaying ? 'Pause' : 'Play MP3 Naats'}
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
                title="Next Track"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {/* Mode Toggle (Repeat all, Repeat one, Shuffle) */}
              <button
                onClick={togglePlaybackMode}
                className="p-1.5 rounded-lg bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 hover:text-amber-300 transition-all cursor-pointer hidden xs:flex items-center justify-center"
                title={`Playback Mode: ${playbackMode}`}
              >
                {playbackMode === 'repeat-all' && <Repeat className="w-3.5 h-3.5" />}
                {playbackMode === 'repeat-one' && <Repeat1 className="w-3.5 h-3.5 text-amber-300" />}
                {playbackMode === 'shuffle' && <Shuffle className="w-3.5 h-3.5 text-amber-300" />}
              </button>

              {/* Toggle Playlist Tracks */}
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  showPlaylist
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                    : 'bg-emerald-900/60 border-emerald-500/30 text-emerald-300 hover:text-amber-300'
                }`}
                title="Toggle Track List"
              >
                <ListMusic className="w-3.5 h-3.5" />
              </button>

              {/* Expand Seeker & Volume */}
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
                  {duration > 0 ? formatTime(duration) : (currentTrack.duration || '--:--')}
                </span>
              </div>

              {/* Volume & Details Row */}
              <div className="flex items-center justify-between gap-4 pt-1">
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
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 sm:w-28 accent-amber-400 h-1 bg-emerald-900/80 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-emerald-300/80">
                    {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                  </span>
                </div>

                {/* Quick Info */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-amber-300/80">
                  <span className="flex items-center gap-1">
                    <Music2 className="w-3 h-3 text-amber-400" />
                    <span>Track {currentTrackIndex + 1}/{TRACKS.length}</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
