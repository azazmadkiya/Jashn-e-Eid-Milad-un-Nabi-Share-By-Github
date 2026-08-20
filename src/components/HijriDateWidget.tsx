import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Moon, RefreshCw, SlidersHorizontal, Clock } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface HijriDateWidgetProps {
  onInteract?: () => void;
}

const ISLAMIC_MONTHS_EN = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

const ISLAMIC_MONTHS_AR = [
  "المحرم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

function toArabicDigits(num: number | string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, (digit) => arabicDigits[parseInt(digit, 10)]);
}

function getHijriDetails(gDate: Date) {
  let day = 0;
  let monthIndex = -1;
  let year = 0;

  try {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(gDate);
    for (const part of parts) {
      if (part.type === 'day') day = parseInt(part.value.replace(/[^\d]/g, ''), 10);
      if (part.type === 'month') monthIndex = parseInt(part.value.replace(/[^\d]/g, ''), 10) - 1;
      if (part.type === 'year') year = parseInt(part.value.replace(/[^\d]/g, ''), 10);
    }
  } catch {}

  if (isNaN(day) || monthIndex < 0 || monthIndex > 11 || isNaN(year) || year <= 0) {
    const dayVal = gDate.getDate();
    const monthVal = gDate.getMonth();
    const yearVal = gDate.getFullYear();

    let m = monthVal + 1;
    let y = yearVal;
    if (m < 3) {
      y -= 1;
      m += 12;
    }

    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayVal + b - 1524.5;

    const z = jd + 0.5;
    const i = Math.floor(z);
    const l = Math.floor((i - 1948440 + 10632) / 10631);
    const n = Math.floor((i - 1948440 + 10632 - 10631 * l + 354) / 354);
    const j = Math.floor((10982 - n) / 5305) * Math.floor((5570 - n) / 10631) + Math.floor(n / 354);
    const l2 = l * 30 + j - 1;
    const i2 = i - 1948440 - l2;
    const hMonth = Math.floor((i2 + 28.5) / 29.5);
    const hYear = Math.floor((l2 * 10631 + 130) / 354) + 1;
    const hDay = Math.floor(i2 - Math.floor(hMonth * 29.5 - 28.5) + 0.5);

    day = Math.max(1, hDay);
    monthIndex = Math.max(0, Math.min(11, hMonth - 1));
    year = hYear;
  }

  const monthEn = ISLAMIC_MONTHS_EN[monthIndex] || 'Safar';
  const monthAr = ISLAMIC_MONTHS_AR[monthIndex] || 'صفر';

  const formattedEn = `${day} ${monthEn}, ${year} AH`;
  const formattedAr = `${toArabicDigits(day)} ${monthAr} ${toArabicDigits(year)} هـ`;

  return {
    day,
    monthIndex,
    year,
    monthEn,
    monthAr,
    formattedEn,
    formattedAr,
  };
}

export const HijriDateWidget: React.FC<HijriDateWidgetProps> = ({ onInteract }) => {
  const [selectedGregorianDate, setSelectedGregorianDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [hijriFormatted, setHijriFormatted] = useState<string>('');
  const [hijriMonthArabic, setHijriMonthArabic] = useState<string>('');
  const [gregorianFormatted, setGregorianFormatted] = useState<string>('');
  const [showAdjustPanel, setShowAdjustPanel] = useState<boolean>(false);

  useEffect(() => {
    try {
      const gDate = new Date(selectedGregorianDate);
      gDate.setDate(gDate.getDate() + dayOffset);

      const gFormatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setGregorianFormatted(gFormatter.format(new Date(selectedGregorianDate)));

      const hijriInfo = getHijriDetails(gDate);
      setHijriFormatted(hijriInfo.formattedEn);
      setHijriMonthArabic(hijriInfo.formattedAr);
    } catch {
      setHijriFormatted("12 Rabi' al-Awwal, 1448 AH");
      setHijriMonthArabic('١٢ ربيع الأول ١٤٤٨ هـ');
    }
  }, [selectedGregorianDate, dayOffset]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    soundManager.playCassetteClick();
    setSelectedGregorianDate(e.target.value);
    if (onInteract) onInteract();
  };

  const handleOffsetChange = (delta: number) => {
    soundManager.playCassetteClick();
    setDayOffset((prev) => Math.max(-2, Math.min(2, prev + delta)));
    if (onInteract) onInteract();
  };

  const setToToday = () => {
    soundManager.playCassetteClick();
    setSelectedGregorianDate(new Date().toISOString().split('T')[0]);
    if (onInteract) onInteract();
  };

  return (
    <div className="w-full max-w-lg mx-auto my-1.5 sm:my-2 z-10 px-1 sm:px-2">
      <div className="relative bg-gradient-to-b from-emerald-900/90 via-emerald-950/90 to-[#021810]/95 border border-amber-500/40 rounded-2xl p-3 sm:p-4 backdrop-blur-xl shadow-xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-emerald-500/30 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
              ISLAMIC CALENDAR WIDGET
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundManager.playCassetteClick();
                setShowAdjustPanel(!showAdjustPanel);
              }}
              className="p-1 rounded bg-emerald-900/60 border border-emerald-600/40 hover:border-amber-400 text-amber-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
              title="Moon Sighting Adjustment"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Sight ({dayOffset > 0 ? `+${dayOffset}` : dayOffset}d)</span>
            </button>

            <button
              onClick={setToToday}
              className="p-1 rounded bg-emerald-900/60 border border-emerald-600/40 hover:border-amber-400 text-emerald-200 text-[10px] font-mono flex items-center gap-1 transition-colors"
              title="Reset to Today"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Today</span>
            </button>
          </div>
        </div>

        {/* Screen */}
        <div className="bg-[#011a12] border border-emerald-500/40 rounded-xl p-2.5 sm:p-3 shadow-inner relative">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
            
            {/* Hijri */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-center md:justify-start gap-1 text-[11px] text-amber-400 font-mono font-semibold">
                <Moon className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                <span>HIJRI DATE</span>
              </div>
              
              <p className="font-arabic text-xl sm:text-2xl text-amber-300 my-0.5 font-bold">
                {hijriMonthArabic}
              </p>
              
              <p className="text-xs sm:text-sm font-bold text-emerald-100 font-mono">
                {hijriFormatted}
              </p>
            </div>

            <div className="hidden md:block w-px h-10 bg-emerald-700/40" />

            {/* Gregorian */}
            <div className="flex-1 w-full md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-1 text-[11px] text-emerald-300 font-mono font-semibold">
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>GREGORIAN DATE</span>
              </div>

              <p className="text-[10px] text-emerald-300/80 font-mono mt-0.5">
                Calendar Date
              </p>

              <p className="text-xs sm:text-sm font-semibold text-emerald-200 font-serif mt-0.5">
                {gregorianFormatted}
              </p>
            </div>
          </div>

          {/* Date Selector Input */}
          <div className="mt-2 pt-2 border-t border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs">
            <label className="text-emerald-300 font-mono flex items-center gap-1 text-[10px] sm:text-[11px]">
              <Clock className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Convert Date:</span>
            </label>

            <input
              type="date"
              value={selectedGregorianDate}
              onChange={handleDateChange}
              className="w-full sm:w-auto bg-emerald-950 border border-emerald-500/40 rounded px-2 py-0.5 text-amber-300 font-mono text-[11px] focus:outline-none focus:border-amber-400 cursor-pointer text-center sm:text-left"
            />
          </div>
        </div>

        {/* Moon Sighting Panel */}
        {showAdjustPanel && (
          <div className="mt-2 p-2 bg-emerald-950/90 border border-amber-500/30 rounded-xl text-xs flex items-center justify-between gap-2">
            <span className="text-emerald-200 font-mono text-[10px]">
              Moon Sighting Offset:
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              <button
                onClick={() => handleOffsetChange(-1)}
                className="w-5 h-5 rounded bg-emerald-900 border border-emerald-600 text-amber-300 hover:bg-emerald-800 font-bold text-xs"
              >
                -1d
              </button>
              <span className="text-amber-400 font-bold px-1 text-xs">
                {dayOffset > 0 ? `+${dayOffset}` : dayOffset}d
              </span>
              <button
                onClick={() => handleOffsetChange(1)}
                className="w-5 h-5 rounded bg-emerald-900 border border-emerald-600 text-amber-300 hover:bg-emerald-800 font-bold text-xs"
              >
                +1d
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
