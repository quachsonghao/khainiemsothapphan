import React, { useState } from 'react';
import { Volume2, Plus, Minus, Search, ArrowRight, CheckCircle2, XCircle, HelpCircle, Check, Sparkles, RotateCw } from 'lucide-react';
import { PlaceKey, PLACE_CONFIG, PlaceInfo } from '../types/math';
import { readDecimalNumber, speakVietnamese } from '../utils/vietnameseNumberReader';
import { sounds } from '../utils/audio';
import { Fraction } from './Fraction';
import { useOrientation } from '../context/OrientationContext';
import confetti from 'canvas-confetti';

interface PlaceValueTableProps {
  onEarnStar?: () => void;
}

interface PlaceValuePracticeQuestion {
  id: number;
  question: string;
  contextNumber: string;
  options: { label: string; isFraction?: boolean; num?: number; den?: number; whole?: number }[];
  correctAnswer: string;
  explanation: string;
}

const PLACE_PRACTICE_QUESTIONS: PlaceValuePracticeQuestion[] = [
  {
    id: 1,
    question: 'Trong số thập phân 45,82, chữ số 8 thuộc hàng nào?',
    contextNumber: '45,82',
    options: [
      { label: 'Hàng chục' },
      { label: 'Hàng đơn vị' },
      { label: 'Hàng phần mười' },
      { label: 'Hàng phần trăm' }
    ],
    correctAnswer: 'Hàng phần mười',
    explanation: 'Chữ số 8 đứng ngay sau dấu phẩy, thuộc hàng phần mười.'
  },
  {
    id: 2,
    question: 'Trong số 12,059, giá trị của chữ số 5 là bao nhiêu?',
    contextNumber: '12,059',
    options: [
      { label: '5 đơn vị' },
      { label: '', isFraction: true, num: 5, den: 10 },
      { label: '', isFraction: true, num: 5, den: 100 },
      { label: '', isFraction: true, num: 5, den: 1000 }
    ],
    correctAnswer: '5/100',
    explanation: 'Chữ số 5 đứng ở vị trí thứ hai sau dấu phẩy, thuộc hàng phần trăm nên có giá trị là 5 phần trăm.'
  },
  {
    id: 3,
    question: 'Trong số 308,417, chữ số nào ở hàng phần nghìn?',
    contextNumber: '308,417',
    options: [{ label: '3' }, { label: '8' }, { label: '4' }, { label: '7' }],
    correctAnswer: '7',
    explanation: 'Chữ số 7 đứng ở vị trí thứ ba sau dấu phẩy, thuộc hàng phần nghìn.'
  },
  {
    id: 4,
    question: 'Số thập phân gồm 6 đơn vị, 3 phần mười và 8 phần trăm được viết là:',
    contextNumber: '6 đơn vị, 3 phần mười, 8 phần trăm',
    options: [{ label: '6,38' }, { label: '6,83' }, { label: '63,8' }, { label: '0,638' }],
    correctAnswer: '6,38',
    explanation: 'Phần nguyên là 6, hàng phần mười là 3, hàng phần trăm là 8: viết là 6,38.'
  },
  {
    id: 5,
    question: 'Trong số 9,06, chữ số 0 giữ vai trò gì?',
    contextNumber: '9,06',
    options: [
      { label: 'Hàng đơn vị' },
      { label: 'Hàng phần mười (giữ chỗ)' },
      { label: 'Hàng phần trăm' },
      { label: 'Không có ý nghĩa' }
    ],
    correctAnswer: 'Hàng phần mười (giữ chỗ)',
    explanation: 'Chữ số 0 ở hàng phần mười giúp phân biệt 9,06 (9 đơn vị 6 phần trăm) với 9,6 (9 đơn vị 6 phần mười).'
  },
  {
    id: 6,
    question: 'Số 158,24 có phần nguyên là bao nhiêu?',
    contextNumber: '158,24',
    options: [{ label: '158' }, { label: '24' }, { label: '15' }, { label: '8,24' }],
    correctAnswer: '158',
    explanation: 'Phần nguyên là tất cả các chữ số nằm ở bên trái dấu phẩy (158).'
  },
  {
    id: 7,
    question: 'Trong số 0,004, giá trị của chữ số 4 là:',
    contextNumber: '0,004',
    options: [
      { label: '', isFraction: true, num: 4, den: 10 },
      { label: '', isFraction: true, num: 4, den: 100 },
      { label: '', isFraction: true, num: 4, den: 1000 },
      { label: '4 đơn vị' }
    ],
    correctAnswer: '4/1000',
    explanation: 'Chữ số 4 đứng ở hàng phần nghìn nên có giá trị là 4 phần nghìn.'
  },
  {
    id: 8,
    question: 'Trong số 72,345, chữ số 2 có giá trị là:',
    contextNumber: '72,345',
    options: [{ label: '20' }, { label: '2' }, { label: '0,2' }, { label: '0,02' }],
    correctAnswer: '2',
    explanation: 'Chữ số 2 đứng ở hàng đơn vị (phần nguyên) nên có giá trị là 2 đơn vị.'
  },
  {
    id: 9,
    question: 'Số gồm 5 chục, 2 đơn vị và 9 phần mười được viết là:',
    contextNumber: '5 chục, 2 đơn vị, 9 phần mười',
    options: [{ label: '52,9' }, { label: '5,29' }, { label: '52,09' }, { label: '502,9' }],
    correctAnswer: '52,9',
    explanation: '5 chục và 2 đơn vị tạo thành phần nguyên 52; 9 phần mười ở phần thập phân: 52,9.'
  },
  {
    id: 10,
    question: 'Quan hệ giữa hai hàng liền kề: 1 đơn vị bằng bao nhiêu phần mười?',
    contextNumber: '1 đơn vị = ? phần mười',
    options: [
      { label: '10 phần mười' },
      { label: '100 phần mười' },
      { label: '1 phần mười' },
      { label: 'Không bằng nhau' }
    ],
    correctAnswer: '10 phần mười',
    explanation: 'Mỗi đơn vị của một hàng gấp 10 lần đơn vị của hàng thấp hơn liền sau nó (1 đơn vị = 10 phần mười).'
  },
  {
    id: 11,
    question: 'Trong số 425,716, tổng các chữ số ở phần thập phân là:',
    contextNumber: '425,716',
    options: [{ label: '14 (7 + 1 + 6)' }, { label: '11 (4 + 2 + 5)' }, { label: '25' }, { label: '7' }],
    correctAnswer: '14 (7 + 1 + 6)',
    explanation: 'Phần thập phân gồm ba chữ số: 7, 1 và 6. Tổng là 7 + 1 + 6 = 14.'
  },
  {
    id: 12,
    question: 'Số thập phân 0,85 có thể viết thành phân số thập phân nào?',
    contextNumber: '0,85 = ?',
    options: [
      { label: '', isFraction: true, num: 85, den: 10 },
      { label: '', isFraction: true, num: 85, den: 100 },
      { label: '', isFraction: true, num: 85, den: 1000 },
      { label: '', isFraction: true, num: 8, den: 5 }
    ],
    correctAnswer: '85/100',
    explanation: '0,85 gồm 85 phần trăm nên bằng 85 phần 100.'
  }
];

export const PlaceValueTable: React.FC<PlaceValueTableProps> = ({ onEarnStar }) => {
  const { isLandscape, toggleForcedLandscape } = useOrientation();
  // Digits for each column
  const [digits, setDigits] = useState<Record<PlaceKey, number>>({
    hundreds: 3,
    tens: 7,
    ones: 5,
    tenths: 4,
    hundredths: 8,
    thousandths: 2,
  });

  const [activeInspectKey, setActiveInspectKey] = useState<PlaceKey>('hundredths');
  const [customInput, setCustomInput] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Practice Questions State
  const [practiceQIdx, setPracticeQIdx] = useState<number>(0);
  const [selectedPracticeOpt, setSelectedPracticeOpt] = useState<string | null>(null);
  const [practiceSubmitted, setPracticeSubmitted] = useState<boolean>(false);

  // Compute number strings
  const wholeVal = digits.hundreds * 100 + digits.tens * 10 + digits.ones;
  const decStr = `${digits.tenths}${digits.hundredths}${digits.thousandths}`;
  const fullNumberStr = `${wholeVal},${decStr}`;
  const readingText = readDecimalNumber(wholeVal, decStr);

  const handleDigitChange = (key: PlaceKey, delta: number) => {
    sounds.playClick();
    setDigits(prev => {
      let val = prev[key] + delta;
      if (val > 9) val = 0;
      if (val < 0) val = 9;
      return { ...prev, [key]: val };
    });
    setActiveInspectKey(key);
  };

  const handleSetNumber = (h: number, t: number, o: number, te: number, hu: number, th: number) => {
    sounds.playClick();
    setDigits({
      hundreds: h,
      tens: t,
      ones: o,
      tenths: te,
      hundredths: hu,
      thousandths: th,
    });
  };

  const handleParseCustom = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    const clean = customInput.trim().replace('.', ',');
    if (!clean) return;

    const parts = clean.split(',');
    const whole = parts[0] || '0';
    const dec = parts[1] || '0';

    const wNum = parseInt(whole, 10) || 0;
    const h = Math.floor((wNum % 1000) / 100);
    const t = Math.floor((wNum % 100) / 10);
    const o = wNum % 10;

    const dStr = dec.padEnd(3, '0').slice(0, 3);
    const te = parseInt(dStr[0] || '0', 10);
    const hu = parseInt(dStr[1] || '0', 10);
    const th = parseInt(dStr[2] || '0', 10);

    setDigits({
      hundreds: h,
      tens: t,
      ones: o,
      tenths: te,
      hundredths: hu,
      thousandths: th,
    });
    setCustomInput('');
  };

  const handleSpeak = () => {
    sounds.playClick();
    setIsSpeaking(true);
    speakVietnamese(readingText, () => setIsSpeaking(false));
  };

  // Inspect details of selected place
  const selectedConfig = PLACE_CONFIG[activeInspectKey];
  const selectedDigitValue = digits[activeInspectKey];

  // Practice question handler
  const currentPracticeQ = PLACE_PRACTICE_QUESTIONS[practiceQIdx];
  const [showTheoryDetails, setShowTheoryDetails] = useState<boolean>(false);

  const handleSelectPracticeOption = (answerKey: string) => {
    if (practiceSubmitted) return;
    sounds.playClick();
    setSelectedPracticeOpt(answerKey);
  };

  const handleSubmitPractice = () => {
    if (!selectedPracticeOpt || practiceSubmitted) return;
    setPracticeSubmitted(true);
    const isCorrect = selectedPracticeOpt === currentPracticeQ.correctAnswer;
    if (isCorrect) {
      sounds.playSuccess();
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      } catch {}
      if (onEarnStar) onEarnStar();
    } else {
      sounds.playError();
    }
  };

  const handleNextPractice = () => {
    sounds.playClick();
    setPracticeSubmitted(false);
    setSelectedPracticeOpt(null);
    setPracticeQIdx(prev => (prev + 1) % PLACE_PRACTICE_QUESTIONS.length);
  };

  // Place ordering
  const wholeKeys: PlaceKey[] = ['hundreds', 'tens', 'ones'];
  const decimalKeys: PlaceKey[] = ['tenths', 'hundredths', 'thousandths'];

  return (
    <div className={`transition-all ${isLandscape ? 'space-y-3' : 'space-y-5 sm:space-y-6'}`}>
      {/* Header explanation - Compact in landscape */}
      <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all ${
        isLandscape ? 'p-3 sm:p-4' : 'p-4 sm:p-6'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div>
            <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-blue-600 uppercase mb-0.5">
              Cấu Tạo & Bảng Các Hàng Chuẩn Tiểu Học
            </div>
            <h2 className={`${isLandscape ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-bold text-slate-900 tracking-tight`}>
              Bảng Vị Trí Hàng Của Số Thập Phân
            </h2>
            {!isLandscape && (
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Số thập phân gồm <strong>Phần nguyên</strong> (ở bên trái dấu phẩy) và <strong>Phần thập phân</strong> (ở bên phải dấu phẩy).
                Mỗi đơn vị của một hàng gấp <strong>10 lần</strong> đơn vị của hàng thấp hơn liền sau nó.
              </p>
            )}
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            <span className="text-xs text-slate-500 font-medium shrink-0">Mẫu:</span>
            {[
              { label: '375,482', h: 3, t: 7, o: 5, te: 4, hu: 8, th: 2 },
              { label: '68,054', h: 0, t: 6, o: 8, te: 0, hu: 5, th: 4 },
              { label: '9,403', h: 0, t: 0, o: 9, te: 4, hu: 0, th: 3 },
              { label: '120,700', h: 1, t: 2, o: 0, te: 7, hu: 0, th: 0 },
              { label: '0,085', h: 0, t: 0, o: 0, te: 0, hu: 8, th: 5 },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSetNumber(p.h, p.t, p.o, p.te, p.hu, p.th)}
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-mono rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}

            <button
              onClick={() => setShowTheoryDetails(!showTheoryDetails)}
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50/60 rounded-lg border border-blue-200/80 cursor-pointer transition-colors"
            >
              {showTheoryDetails ? 'Thu gọn' : 'Nhập số khác'}
            </button>
          </div>
        </div>

        {/* Collapsible Custom Input & Theory in Landscape */}
        {(showTheoryDetails || !isLandscape) && (
          <form onSubmit={handleParseCustom} className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs text-slate-600 font-medium whitespace-nowrap">Nhập số tùy ý:</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Ví dụ: 45,67 hoặc 8,102"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="flex-1 sm:w-64 px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0 cursor-pointer"
              >
                Đưa vào bảng
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile Landscape Hint & Button - only shown when in portrait mode */}
      {!isLandscape && (
        <div className="flex md:hidden items-center justify-between bg-slate-100 p-2 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-700 font-bold ml-1">Xem rõ 7 cột hơn:</span>
          <button
            onClick={toggleForcedLandscape}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-xs cursor-pointer active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-300" />
            <span>Xoay ngang màn hình</span>
          </button>
        </div>
      )}

      {/* Main Interactive Place Value Table */}
      <div className={`bg-white rounded-2xl border-2 border-slate-200 shadow-sm transition-all ${
        isLandscape ? 'p-2 sm:p-3' : 'p-3 sm:p-6'
      }`}>
        <div className="overflow-x-auto touch-scroll no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0">
          <div className="min-w-[580px] sm:min-w-[620px]">
          {/* Top Classification: Phần nguyên vs Phần thập phân */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 sm:mb-2 text-center">
            <div className="col-span-3 bg-emerald-100/70 border border-emerald-300 rounded-lg sm:rounded-xl py-1 px-1 sm:py-1.5">
              <span className="text-[11px] sm:text-xs font-black text-emerald-900 uppercase tracking-wider block">
                Phần Nguyên
              </span>
              <span className="text-[10px] sm:text-[11px] text-emerald-700 font-medium">
                (Bên trái dấu phẩy)
              </span>
            </div>

            <div className="col-span-1 flex items-center justify-center">
              <span className="text-[11px] sm:text-xs font-black text-rose-800 bg-rose-100/80 border border-rose-300 rounded-lg sm:rounded-xl px-1.5 py-1">
                Phẩy (,)
              </span>
            </div>

            <div className="col-span-3 bg-indigo-100/70 border border-indigo-300 rounded-lg sm:rounded-xl py-1 px-1 sm:py-1.5">
              <span className="text-[11px] sm:text-xs font-black text-indigo-900 uppercase tracking-wider block">
                Phần Thập Phân
              </span>
              <span className="text-[10px] sm:text-[11px] text-indigo-700 font-medium">
                (Bên phải dấu phẩy)
              </span>
            </div>
          </div>

          {/* Place Column Names with standard fractions */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {wholeKeys.map((key) => {
              const cfg = PLACE_CONFIG[key];
              const isSelected = activeInspectKey === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    sounds.playClick();
                    setActiveInspectKey(key);
                  }}
                  className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-center border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-100/70 ring-2 ring-emerald-200 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <span className="text-[11px] sm:text-xs font-bold text-slate-900 block truncate">
                    {cfg.name}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-mono font-bold mt-0.5 block">
                    × {cfg.multiplier}
                  </span>
                </button>
              );
            })}

            {/* Comma separator column */}
            <div className="flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono leading-none">,</span>
              <span className="text-[9px] sm:text-[10px] text-rose-700 font-bold">Dấu phẩy</span>
            </div>

            {decimalKeys.map((key) => {
              const cfg = PLACE_CONFIG[key];
              const isSelected = activeInspectKey === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    sounds.playClick();
                    setActiveInspectKey(key);
                  }}
                  className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-center border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-100/70 ring-2 ring-indigo-200 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <span className="text-[11px] sm:text-xs font-bold text-slate-900 block truncate">
                    {cfg.name}
                  </span>
                  <div className="text-[10px] sm:text-xs text-slate-700 font-mono font-bold mt-0.5 inline-flex items-center gap-0.5 justify-center">
                    <span>×</span>
                    {cfg.fractionNumerator && cfg.fractionDenominator ? (
                      <Fraction num={cfg.fractionNumerator} den={cfg.fractionDenominator} size="xs" />
                    ) : (
                      <span>{cfg.decimalText}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Digits & Counters */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 bg-slate-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200">
            {wholeKeys.map((key) => {
              const val = digits[key];
              const isSelected = activeInspectKey === key;
              return (
                <div key={key} className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <button
                    onClick={() => handleDigitChange(key, 1)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 flex items-center justify-center text-slate-600 shadow-2xs cursor-pointer"
                    title="Tăng chữ số"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveInspectKey(key);
                    }}
                    className={`w-full py-1 sm:py-2.5 text-xl sm:text-2xl font-mono font-black rounded-lg sm:rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-102'
                        : 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    {val}
                  </button>

                  <button
                    onClick={() => handleDigitChange(key, -1)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 flex items-center justify-center text-slate-600 shadow-2xs cursor-pointer"
                    title="Giảm chữ số"
                  >
                    <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Comma Column */}
            <div className="flex items-center justify-center">
              <span className="text-2xl sm:text-4xl font-black text-rose-600 font-mono select-none">,</span>
            </div>

            {decimalKeys.map((key) => {
              const val = digits[key];
              const isSelected = activeInspectKey === key;
              return (
                <div key={key} className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <button
                    onClick={() => handleDigitChange(key, 1)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 flex items-center justify-center text-slate-600 shadow-2xs cursor-pointer"
                    title="Tăng chữ số"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveInspectKey(key);
                    }}
                    className={`w-full py-1 sm:py-2.5 text-xl sm:text-2xl font-mono font-black rounded-lg sm:rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-102'
                        : 'bg-white hover:bg-indigo-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    {val}
                  </button>

                  <button
                    onClick={() => handleDigitChange(key, -1)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 flex items-center justify-center text-slate-600 shadow-2xs cursor-pointer"
                    title="Giảm chữ số"
                  >
                    <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

        {/* Read Out Aloud Row */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Số thập phân:</span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-slate-900 tracking-tight">
              {fullNumberStr}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 italic">
              ({readingText})
            </span>
          </div>

          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isSpeaking
                ? 'bg-amber-100 text-amber-800 animate-pulse'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? 'Đang đọc...' : 'Nghe đọc số'}</span>
          </button>
        </div>
      </div>

      {/* Inspector Card & Expanded Form Breakdown */}
      <div className={`grid grid-cols-1 md:grid-cols-2 items-start transition-all ${isLandscape ? 'gap-3' : 'gap-5 sm:gap-6'}`}>
        {/* Left: Digit Inspector (Kính lúp soi chữ số) */}
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all ${
          isLandscape ? 'p-3 sm:p-4 space-y-2.5' : 'p-4 sm:p-6 space-y-4'
        }`}>
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
            <Search className="w-4 h-4 text-blue-600" />
            <span>Kính Lúp Soi Chữ Số Đang Chọn</span>
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Chữ số đang soi:</span>
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-xs">
                {selectedDigitValue}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Vị trí:</span>
                <strong className={`text-xs sm:text-sm ${selectedConfig.part === 'whole' ? 'text-emerald-700' : 'text-indigo-700'}`}>
                  {selectedConfig.partName}
                </strong>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Tên hàng:</span>
                <strong className="text-xs sm:text-sm text-slate-900">
                  {selectedConfig.name}
                </strong>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500 text-[10px]">Giá trị của chữ số này trong số:</div>
              <div className="text-xs sm:text-sm font-bold font-mono text-blue-900 flex items-center gap-1.5 flex-wrap">
                {selectedConfig.part === 'whole' ? (
                  <span>
                    {selectedDigitValue} × {selectedConfig.multiplier} = {selectedDigitValue * selectedConfig.multiplier}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <span>
                      {(selectedDigitValue * selectedConfig.multiplier).toFixed(
                        selectedConfig.key === 'tenths' ? 1 : selectedConfig.key === 'hundredths' ? 2 : 3
                      ).replace('.', ',')}
                    </span>
                    <span className="text-slate-500">(hay</span>
                    <Fraction
                      num={selectedDigitValue}
                      den={selectedConfig.fractionDenominator || 10}
                      size="xs"
                      className="text-blue-900"
                    />
                    <span className="text-slate-500">)</span>
                  </span>
                )}
              </div>
              <div className="text-slate-600 text-[10px] sm:text-xs pt-0.5 leading-relaxed">
                {selectedConfig.description}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic">
            👉 Bấm vào bất kỳ cột hàng nào trong bảng trên để soi và khám phá giá trị chữ số.
          </div>
        </div>

        {/* Right: Expanded Form with Standard Fractions */}
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all ${
          isLandscape ? 'p-3 sm:p-4 space-y-2.5' : 'p-4 sm:p-6 space-y-4'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-bold text-slate-900">
              Biểu Thức Phân Tích Tổng (Expanded Form)
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs sm:text-sm">
            <div className="text-slate-600 text-xs font-sans">
              Phân tích theo các số hạng thập phân:
            </div>
            <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-slate-200 text-slate-900 font-semibold font-mono text-xs sm:text-sm leading-relaxed break-all">
              <span className="text-blue-700 font-bold">{fullNumberStr}</span> ={' '}
              {digits.hundreds > 0 && `${digits.hundreds * 100} + `}
              {digits.tens > 0 && `${digits.tens * 10} + `}
              {digits.ones} +{' '}
              <span className="text-indigo-600">{(digits.tenths * 0.1).toFixed(1).replace('.', ',')}</span> +{' '}
              <span className="text-purple-600">{(digits.hundredths * 0.01).toFixed(2).replace('.', ',')}</span> +{' '}
              <span className="text-rose-600">{(digits.thousandths * 0.001).toFixed(3).replace('.', ',')}</span>
            </div>

            <div className="text-slate-600 text-xs font-sans pt-0.5">
              Phân tích dưới dạng phân số thập phân chuẩn giáo trình:
            </div>
            <div className="p-2 sm:p-2.5 bg-white rounded-lg border border-slate-200 text-slate-900 font-semibold text-xs leading-relaxed flex flex-wrap items-center gap-1">
              <span className="text-blue-700 font-bold font-mono">{fullNumberStr}</span>
              <span>=</span>
              {digits.hundreds > 0 && <span className="font-mono">{digits.hundreds * 100} + </span>}
              {digits.tens > 0 && <span className="font-mono">{digits.tens * 10} + </span>}
              <span className="font-mono">{digits.ones}</span>
              <span>+</span>
              <Fraction num={digits.tenths} den={10} size="xs" className="text-indigo-600" />
              <span>+</span>
              <Fraction num={digits.hundredths} den={100} size="xs" className="text-purple-600" />
              <span>+</span>
              <Fraction num={digits.thousandths} den={1000} size="xs" className="text-rose-600" />
            </div>
          </div>

          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] sm:text-xs text-amber-900 leading-relaxed">
            <strong>Quy tắc nhớ:</strong> Đọc hoặc viết số thập phân lần lượt từ hàng cao đến hàng thấp: 
            hết <em>phần nguyên</em>, viết/đọc <em>dấu phẩy</em>, rồi đến <em>phần thập phân</em>.
          </div>
        </div>
      </div>

      {/* Expanded Practice Section: 12 Place Value Questions */}
      <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all ${
        isLandscape ? 'p-3 sm:p-4 space-y-3' : 'p-4 sm:p-6 space-y-4'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Luyện Tập Nhận Biết Hàng (12 Câu Hỏi Đố Nhanh)</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Câu {practiceQIdx + 1} / {PLACE_PRACTICE_QUESTIONS.length}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNextPractice}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <span>Câu kế tiếp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <p className="text-sm font-semibold text-slate-900">
            {currentPracticeQ.question}
          </p>
          {currentPracticeQ.contextNumber && (
            <div className="text-xl font-bold font-mono text-indigo-700 bg-white inline-block px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {currentPracticeQ.contextNumber}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentPracticeQ.options.map((opt, idx) => {
            const optKey = opt.isFraction ? `${opt.num}/${opt.den}` : opt.label;
            const isChosen = selectedPracticeOpt === optKey;
            const isCorrect = optKey === currentPracticeQ.correctAnswer;

            let optClass = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs';
            if (practiceSubmitted) {
              if (isCorrect) {
                optClass = 'bg-emerald-500 text-white border-emerald-500 font-bold';
              } else if (isChosen && !isCorrect) {
                optClass = 'bg-rose-500 text-white border-rose-500 font-bold';
              } else {
                optClass = 'bg-slate-50 text-slate-400 border-slate-200 opacity-60';
              }
            } else if (isChosen) {
              optClass = 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-300 font-semibold';
            }

            return (
              <button
                key={idx}
                disabled={practiceSubmitted}
                onClick={() => handleSelectPracticeOption(optKey)}
                className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between min-h-[48px] ${optClass}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs opacity-70">{String.fromCharCode(65 + idx)}.</span>
                  {opt.isFraction && opt.num && opt.den ? (
                    <Fraction
                      num={opt.num}
                      den={opt.den}
                      whole={opt.whole}
                      size="sm"
                      className={practiceSubmitted && (isCorrect || isChosen) ? 'text-white' : 'text-slate-900'}
                    />
                  ) : (
                    <span>{opt.label}</span>
                  )}
                </div>
                {practiceSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-white" />}
                {practiceSubmitted && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Submit & Explanation */}
        <div className="pt-2 flex items-center justify-between">
          {!practiceSubmitted ? (
            <button
              onClick={handleSubmitPractice}
              disabled={!selectedPracticeOpt}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
            >
              Kiểm Tra Câu Trả Lời
            </button>
          ) : (
            <button
              onClick={handleNextPractice}
              className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <span>Làm câu tiếp theo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {practiceSubmitted && (
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              selectedPracticeOpt === currentPracticeQ.correctAnswer
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="font-bold mb-0.5">
              {selectedPracticeOpt === currentPracticeQ.correctAnswer ? 'Chính xác! Giỏi lắm.' : 'Chưa đúng rồi.'}
            </div>
            <div>{currentPracticeQ.explanation}</div>
          </div>
        )}
      </div>
    </div>
  );
};
