import React, { useState, useEffect } from 'react';
import { ParticleBackground } from './components/ParticleBackground';
import { LanternsAndFlags } from './components/LanternsAndFlags';
import { CountdownTimer } from './components/CountdownTimer';
import { HijriDateWidget } from './components/HijriDateWidget';
import { MusicPlayer } from './components/MusicPlayer';
import { soundManager } from './utils/soundEffects';
import { AUTHENTIC_PHRASES } from './data/miladData';

export default function App() {
  const [showerTrigger, setShowerTrigger] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Rotating status phrase
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % AUTHENTIC_PHRASES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleInteract = () => {
    setShowerTrigger((prev) => prev + 1);
  };

  // Keyboard Event Listeners for interactive nostalgia
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        soundManager.playSalawatChime();
        handleInteract();
      } else if (e.key === 's' || e.key === 'S') {
        soundManager.playSpritzSound();
        handleInteract();
      } else if (e.key === 't' || e.key === 'T') {
        soundManager.playTasbeehClick();
        handleInteract();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen text-emerald-50 selection:bg-emerald-500 selection:text-emerald-950 pb-20 font-sans">
      {/* Background Starry Sky & Canvas Rose Petal Engine */}
      <ParticleBackground showerTrigger={showerTrigger} />

      {/* Swaying Lanterns & Green Pennants */}
      <LanternsAndFlags onLanternClick={handleInteract} />

      {/* Main Container */}
      <main className="relative z-10 pt-2 sm:pt-4 px-2 sm:px-4 max-w-4xl mx-auto flex flex-col items-center w-full">
        
        {/* Status Badge Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md text-[10px] sm:text-xs text-amber-300 shadow-md mb-1 max-w-[92vw] overflow-hidden">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="font-mono uppercase tracking-wider truncate">{AUTHENTIC_PHRASES[phraseIndex]}</span>
        </div>

        {/* Header Title Section */}
        <div className="text-center max-w-2xl mx-auto mb-1 px-2">
          <h1 className="font-title text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-emerald-300 drop-shadow-md my-0.5 leading-tight">
            JASHN-E-EID MILAD-UN-NABI
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-emerald-200/90 font-serif max-w-lg mx-auto leading-tight mt-0.5">
            Jashn-E-Eid Milad-Un-Nabi Mubarak
          </p>
        </div>

        {/* 12 Rabi-ul-Awwal Countdown Timer */}
        <CountdownTimer onInteract={handleInteract} />

        {/* Nostalgic Hijri Date Desktop Widget */}
        <HijriDateWidget onInteract={handleInteract} />

        {/* Footer Credit Section */}
        <footer className="mt-3 mb-10 text-center border-t border-amber-500/20 pt-2.5 w-full max-w-lg">
          <p className="text-xs font-serif tracking-widest text-amber-300/80 uppercase">
            Design By <span className="font-bold text-amber-200 hover:text-amber-100 transition-colors">Azazmadkiya</span>
          </p>
        </footer>

      </main>

      {/* Naat Music Player */}
      <MusicPlayer />
    </div>
  );
}
