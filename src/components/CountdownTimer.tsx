import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Calendar } from 'lucide-react';

interface CountdownTimerProps {
  onInteract?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ onInteract }) => {
  // Target date for 12 Rabi-ul-Awwal 1448 AH: August 26, 2026 00:00:00
  const targetDate = new Date('2026-08-26T00:00:00');

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isArrived: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isArrived: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, isArrived: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto my-1.5 sm:my-2 z-10 px-1 sm:px-2">
      <div className="relative bg-gradient-to-b from-emerald-950/90 via-emerald-900/80 to-emerald-950/95 border border-amber-400/40 rounded-2xl p-3 sm:p-4 backdrop-blur-xl shadow-xl overflow-hidden text-center">
        {/* Title */}
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <h2 className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
            12 RABI-UL-AWWAL COUNTDOWN
          </h2>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        </div>

        {timeLeft.isArrived ? (
          <div className="py-2 bg-emerald-900/60 border border-amber-400/60 rounded-xl animate-bounce">
            <p className="text-sm sm:text-base font-bold text-amber-300 tracking-wide">
              ✨ 12 Rabi-ul-Awwal Mubarak! ✨
            </p>
            <p className="text-xs text-emerald-200 mt-0.5">
              May the blessings of the Holy Prophet ﷺ illuminate your heart & home.
            </p>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 my-1">
            <div className="bg-[#011a12] border border-amber-500/30 rounded-xl p-1.5 sm:p-2.5 shadow-inner flex flex-col items-center">
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 drop-shadow">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/80">
                Days
              </span>
            </div>

            <div className="bg-[#011a12] border border-amber-500/30 rounded-xl p-1.5 sm:p-2.5 shadow-inner flex flex-col items-center">
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 drop-shadow">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/80">
                Hours
              </span>
            </div>

            <div className="bg-[#011a12] border border-amber-500/30 rounded-xl p-1.5 sm:p-2.5 shadow-inner flex flex-col items-center">
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 drop-shadow">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/80">
                Mins
              </span>
            </div>

            <div className="bg-[#011a12] border border-amber-500/30 rounded-xl p-1.5 sm:p-2.5 shadow-inner flex flex-col items-center">
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 drop-shadow">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/80">
                Secs
              </span>
            </div>
          </div>
        )}

        <div className="mt-2 text-[10px] sm:text-[11px] font-mono text-emerald-300/90 flex items-center justify-center gap-1">
          <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Target Date: 12 Rabi-ul-Awwal 1448 AH (Approx. 26 August 2026)</span>
        </div>
      </div>
    </div>
  );
};
