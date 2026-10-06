import React, { useState } from 'react';
import { Volume2, CheckCircle2, XCircle, RefreshCw, ArrowRight, BookOpen, Lightbulb, Delete, Sparkles, Filter } from 'lucide-react';
import { readDecimalNumber, speakVietnamese } from '../utils/vietnameseNumberReader';
import { sounds } from '../utils/audio';
import { Fraction } from './Fraction';
import confetti from 'canvas-confetti';
import { useOrientation } from '../context/OrientationContext';

interface ReadingWritingStudioProps {
  onEarnStar?: () => void;
}

interface PracticeItem {
  id: string;
  category: 'tenths' | 'hundredths' | 'thousandths';
  categoryLabel: string;
  numberStr: string; // e.g. "8,06"
  whole: number;
  decStr: string;
  readingStandard: string;
  wordTiles: string[];
  distractorTiles: string[];
  placeReadingAlternative?: string;
  pitfallTip: string;
}

const PRACTICE_ITEMS: PracticeItem[] = [
  // TENTHS (Phần mười)
  {
    id: 'p1',
    category: 'tenths',
    categoryLabel: 'Phần mười',
    numberStr: '45,8',
    whole: 45,
    decStr: '8',
    readingStandard: 'Bốn mươi lăm phẩy tám',
    wordTiles: ['Bốn mươi lăm', 'phẩy', 'tám'],
    distractorTiles: ['tư', 'tám mươi', 'không'],
    placeReadingAlternative: '45 đơn vị, 8 phần mười',
    pitfallTip: 'Chữ số 8 đứng ngay sau dấu phẩy thuộc hàng phần mười.'
  },
  {
    id: 'p2',
    category: 'tenths',
    categoryLabel: 'Phần mười',
    numberStr: '3,5',
    whole: 3,
    decStr: '5',
    readingStandard: 'Ba phẩy năm',
    wordTiles: ['Ba', 'phẩy', 'năm'],
    distractorTiles: ['lăm', 'mười lăm', 'không'],
    placeReadingAlternative: '3 đơn vị, 5 phần mười (hoặc ba và một nửa)',
    pitfallTip: 'Hàng phần mười là chữ số 5 đứng ngay sau dấu phẩy.'
  },
  {
    id: 'p3',
    category: 'tenths',
    categoryLabel: 'Phần mười',
    numberStr: '12,4',
    whole: 12,
    decStr: '4',
    readingStandard: 'Mười hai phẩy bốn',
    wordTiles: ['Mười hai', 'phẩy', 'bốn'],
    distractorTiles: ['tư', 'hai mươi', 'bốn mươi'],
    placeReadingAlternative: '12 đơn vị, 4 phần mười',
    pitfallTip: 'Có thể đọc là "Mười hai phẩy bốn" hoặc "Mười hai phẩy tư".'
  },
  {
    id: 'p4',
    category: 'tenths',
    categoryLabel: 'Phần mười',
    numberStr: '0,9',
    whole: 0,
    decStr: '9',
    readingStandard: 'Không phẩy chín',
    wordTiles: ['Không', 'phẩy', 'chín'],
    distractorTiles: ['chín mươi', 'chín phần trăm', 'một'],
    placeReadingAlternative: '9 phần mười',
    pitfallTip: 'Phần nguyên là 0, ta đọc rõ "Không phẩy chín".'
  },
  {
    id: 'p5',
    category: 'tenths',
    categoryLabel: 'Phần mười',
    numberStr: '80,6',
    whole: 80,
    decStr: '6',
    readingStandard: 'Tám mươi phẩy sáu',
    wordTiles: ['Tám mươi', 'phẩy', 'sáu'],
    distractorTiles: ['tám', 'sáu mươi', 'không sáu'],
    placeReadingAlternative: '80 đơn vị, 6 phần mười',
    pitfallTip: 'Phần nguyên là 80 (tám mươi), phần thập phân là 6 (sáu phần mười).'
  },
  {
    id: 'p6',
    category: 'tenths',
    categoryLabel: 'Phần mười',
    numberStr: '105,2',
    whole: 105,
    decStr: '2',
    readingStandard: 'Một trăm linh năm phẩy hai',
    wordTiles: ['Một trăm linh năm', 'phẩy', 'hai'],
    distractorTiles: ['lăm', 'hai mươi', 'năm mươi'],
    placeReadingAlternative: '105 đơn vị, 2 phần mười',
    pitfallTip: 'Phần nguyên là 105 đọc là "Một trăm linh năm" (hoặc "Một trăm lẻ năm").'
  },

  // HUNDREDTHS (Phần trăm)
  {
    id: 'p7',
    category: 'hundredths',
    categoryLabel: 'Phần trăm',
    numberStr: '8,06',
    whole: 8,
    decStr: '06',
    readingStandard: 'Tám phẩy không sáu',
    wordTiles: ['Tám', 'phẩy', 'không', 'sáu'],
    distractorTiles: ['sáu mươi', 'linh sáu', 'tám mươi'],
    placeReadingAlternative: '8 đơn vị, 6 phần trăm',
    pitfallTip: 'Hàng phần mười là chữ số 0, đọc là "không sáu" (8,06) chứ không phải 8,6.'
  },
  {
    id: 'p8',
    category: 'hundredths',
    categoryLabel: 'Phần trăm',
    numberStr: '124,35',
    whole: 124,
    decStr: '35',
    readingStandard: 'Một trăm hai mươi tư phẩy ba mươi lăm',
    wordTiles: ['Một trăm hai mươi tư', 'phẩy', 'ba mươi lăm'],
    distractorTiles: ['hai mươi bốn', 'năm', 'ba mươi'],
    placeReadingAlternative: '124 đơn vị, 35 phần trăm',
    pitfallTip: 'Phần thập phân là 35 gồm 3 phần mười và 5 phần trăm.'
  },
  {
    id: 'p9',
    category: 'hundredths',
    categoryLabel: 'Phần trăm',
    numberStr: '0,75',
    whole: 0,
    decStr: '75',
    readingStandard: 'Không phẩy bảy mươi lăm',
    wordTiles: ['Không', 'phẩy', 'bảy mươi lăm'],
    distractorTiles: ['bảy lăm', 'năm mươi', 'bảy'],
    placeReadingAlternative: '75 phần trăm',
    pitfallTip: '0,75 tương ứng với phân số 75 phần 100 (tức ba phần tư).'
  },
  {
    id: 'p10',
    category: 'hundredths',
    categoryLabel: 'Phần trăm',
    numberStr: '15,08',
    whole: 15,
    decStr: '08',
    readingStandard: 'Mười lăm phẩy không tám',
    wordTiles: ['Mười lăm', 'phẩy', 'không tám'],
    distractorTiles: ['tám mươi', 'tám', 'linh tám'],
    placeReadingAlternative: '15 đơn vị, 8 phần trăm',
    pitfallTip: 'Chữ số 0 ở hàng phần mười, chữ số 8 ở hàng phần trăm.'
  },
  {
    id: 'p11',
    category: 'hundredths',
    categoryLabel: 'Phần trăm',
    numberStr: '9,45',
    whole: 9,
    decStr: '45',
    readingStandard: 'Chín phẩy bốn mươi lăm',
    wordTiles: ['Chín', 'phẩy', 'bốn mươi lăm'],
    distractorTiles: ['bốn mươi năm', 'năm mươi tư', 'chín mươi'],
    placeReadingAlternative: '9 đơn vị, 4 phần mười và 5 phần trăm',
    pitfallTip: 'Phần thập phân kết thúc bằng 5 sau "mươi", đọc là "lăm".'
  },
  {
    id: 'p12',
    category: 'hundredths',
    categoryLabel: 'Phần trăm',
    numberStr: '60,04',
    whole: 60,
    decStr: '04',
    readingStandard: 'Sáu mươi phẩy không bốn',
    wordTiles: ['Sáu mươi', 'phẩy', 'không bốn'],
    distractorTiles: ['bốn mươi', 'linh bốn', 'sáu'],
    placeReadingAlternative: '60 đơn vị, 4 phần trăm',
    pitfallTip: 'Số 60,04 có chữ số 0 ở hàng phần mười, viết đúng là 60,04 (khác với 60,4).'
  },

  // THOUSANDTHS (Phần nghìn)
  {
    id: 'p13',
    category: 'thousandths',
    categoryLabel: 'Phần nghìn',
    numberStr: '0,007',
    whole: 0,
    decStr: '007',
    readingStandard: 'Không phẩy không không bảy',
    wordTiles: ['Không', 'phẩy', 'không không bảy'],
    distractorTiles: ['bảy', 'bảy mươi', 'một'],
    placeReadingAlternative: '0 đơn vị, 7 phần nghìn',
    pitfallTip: 'Chữ số 7 ở hàng phần nghìn, trước đó có hai chữ số 0 ở hàng phần mười và phần trăm.'
  },
  {
    id: 'p14',
    category: 'thousandths',
    categoryLabel: 'Phần nghìn',
    numberStr: '9,403',
    whole: 9,
    decStr: '403',
    readingStandard: 'Chín phẩy bốn trăm linh ba',
    wordTiles: ['Chín', 'phẩy', 'bốn trăm linh ba'],
    distractorTiles: ['bốn ba', 'không ba', 'chục'],
    placeReadingAlternative: '9 đơn vị, 4 phần mười, 3 phần nghìn',
    pitfallTip: 'Chữ số 0 ở hàng phần trăm, chữ số 3 ở hàng phần nghìn.'
  },
  {
    id: 'p15',
    category: 'thousandths',
    categoryLabel: 'Phần nghìn',
    numberStr: '0,125',
    whole: 0,
    decStr: '125',
    readingStandard: 'Không phẩy một trăm hai mươi lăm',
    wordTiles: ['Không', 'phẩy', 'một trăm hai mươi lăm'],
    distractorTiles: ['mười hai năm', 'một hai năm', 'hai lăm'],
    placeReadingAlternative: '125 phần nghìn (tương đương 1 phần 8)',
    pitfallTip: 'Đọc phần thập phân 125 như đọc số tự nhiên: "một trăm hai mươi lăm".'
  },
  {
    id: 'p16',
    category: 'thousandths',
    categoryLabel: 'Phần nghìn',
    numberStr: '34,018',
    whole: 34,
    decStr: '018',
    readingStandard: 'Ba mươi tư phẩy không trăm mười tám',
    wordTiles: ['Ba mươi tư', 'phẩy', 'không trăm mười tám'],
    distractorTiles: ['mười tám', 'một trăm tám', 'ba mươi bốn'],
    placeReadingAlternative: '34 đơn vị, 1 phần trăm, 8 phần nghìn',
    pitfallTip: 'Hàng phần mười là chữ số 0, đọc là "không trăm mười tám" hoặc "không mười tám".'
  },
  {
    id: 'p17',
    category: 'thousandths',
    categoryLabel: 'Phần nghìn',
    numberStr: '1,005',
    whole: 1,
    decStr: '005',
    readingStandard: 'Một phẩy không không năm',
    wordTiles: ['Một', 'phẩy', 'không không năm'],
    distractorTiles: ['năm', 'năm trăm', 'linh năm'],
    placeReadingAlternative: '1 đơn vị, 5 phần nghìn',
    pitfallTip: '1,005 có 2 chữ số 0 giữ chỗ ở hàng phần mười và phần trăm.'
  },
  {
    id: 'p18',
    category: 'thousandths',
    categoryLabel: 'Phần nghìn',
    numberStr: '200,008',
    whole: 200,
    decStr: '008',
    readingStandard: 'Hai trăm phẩy không không tám',
    wordTiles: ['Hai trăm', 'phẩy', 'không không tám'],
    distractorTiles: ['tám', 'tám mươi', 'hai chục'],
    placeReadingAlternative: '200 đơn vị, 8 phần nghìn',
    pitfallTip: 'Phần nguyên là 200, phần thập phân là 8 phần nghìn (008).'
  }
];

export const ReadingWritingStudio: React.FC<ReadingWritingStudioProps> = ({ onEarnStar }) => {
  const { isLandscape } = useOrientation();
  const [studioTab, setStudioTab] = useState<'reading' | 'writing'>('reading');
  const [filterCategory, setFilterCategory] = useState<'all' | 'tenths' | 'hundredths' | 'thousandths'>('all');

  // Filtered practice items
  const filteredItems = filterCategory === 'all'
    ? PRACTICE_ITEMS
    : PRACTICE_ITEMS.filter(it => it.category === filterCategory);

  // Reading Mode State
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedWordTiles, setSelectedWordTiles] = useState<string[]>([]);
  const [readingFeedback, setReadingFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Writing Mode State
  const [writtenInput, setWrittenInput] = useState<string>('');
  const [writingFeedback, setWritingFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Current active item
  const safeIdx = currentIdx % filteredItems.length;
  const currentItem = filteredItems[safeIdx] || PRACTICE_ITEMS[0];

  // Available tiles for Reading Mode
  const [availableTiles, setAvailableTiles] = useState<string[]>(() => {
    return [...currentItem.wordTiles, ...currentItem.distractorTiles].sort(() => Math.random() - 0.5);
  });

  const loadQuestionByIndex = (newIdx: number) => {
    sounds.playClick();
    setCurrentIdx(newIdx);
    setSelectedWordTiles([]);
    setReadingFeedback(null);
    setWrittenInput('');
    setWritingFeedback(null);
    const item = filteredItems[newIdx % filteredItems.length];
    setAvailableTiles([...item.wordTiles, ...item.distractorTiles].sort(() => Math.random() - 0.5));
  };

  const nextQuestion = () => {
    loadQuestionByIndex((currentIdx + 1) % filteredItems.length);
  };

  const handleTileClick = (word: string, indexInAvailable: number) => {
    sounds.playClick();
    setSelectedWordTiles(prev => [...prev, word]);
    setAvailableTiles(prev => prev.filter((_, idx) => idx !== indexInAvailable));
  };

  const handleRemoveTile = (word: string, indexInSelected: number) => {
    sounds.playClick();
    setSelectedWordTiles(prev => prev.filter((_, idx) => idx !== indexInSelected));
    setAvailableTiles(prev => [...prev, word]);
  };

  const checkReadingAnswer = () => {
    const userString = selectedWordTiles.join(' ').toLowerCase();
    const targetString = currentItem.wordTiles.join(' ').toLowerCase();

    if (userString === targetString) {
      sounds.playSuccess();
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      } catch {}
      setReadingFeedback({
        isCorrect: true,
        message: `Chính xác! Đọc chuẩn là: "${currentItem.readingStandard}".`
      });
      if (onEarnStar) onEarnStar();
    } else {
      sounds.playError();
      setReadingFeedback({
        isCorrect: false,
        message: `Chưa đúng rồi. Hãy chú ý thứ tự: Đọc phần nguyên trước ➔ đọc "phẩy" ➔ đọc phần thập phân.`
      });
    }
  };

  const handleKeypadPress = (val: string) => {
    sounds.playClick();
    if (val === 'backspace') {
      setWrittenInput(prev => prev.slice(0, -1));
      return;
    }
    if (val === 'clear') {
      setWrittenInput('');
      return;
    }
    if (val === ',') {
      if (!writtenInput.includes(',')) {
        setWrittenInput(prev => (prev === '' ? '0,' : prev + ','));
      }
      return;
    }
    setWrittenInput(prev => prev + val);
  };

  const checkWritingAnswer = () => {
    const formatted = writtenInput.trim().replace('.', ',');
    const target = currentItem.numberStr;

    if (formatted === target) {
      sounds.playSuccess();
      try {
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      } catch {}
      setWritingFeedback({
        isCorrect: true,
        message: `Xuất sắc! Bạn đã viết đúng số ${target}.`
      });
      if (onEarnStar) onEarnStar();
    } else {
      sounds.playError();
      setWritingFeedback({
        isCorrect: false,
        message: `Chưa chính xác. Đáp án đúng là "${target}". ${currentItem.pitfallTip}`
      });
    }
  };

  const playTTS = (text: string) => {
    sounds.playClick();
    setIsSpeaking(true);
    speakVietnamese(text, () => setIsSpeaking(false));
  };

  return (
    <div className={`transition-all ${isLandscape ? 'space-y-3' : 'space-y-5 sm:space-y-6'}`}>
      {/* Studio Header & Mode Switcher */}
      <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all ${isLandscape ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-purple-600 uppercase mb-0.5">
              Quy Tắc Đọc & Viết Chuẩn Sách Giáo Khoa (18 Bài Luyện)
            </div>
            <h2 className={`${isLandscape ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-bold text-slate-900 tracking-tight`}>
              Phòng Luyện Đọc & Viết Số Thập Phân
            </h2>
            {!isLandscape && (
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                <strong>Muốn đọc / viết số thập phân:</strong> Làm lần lượt từ hàng cao đến hàng thấp.
                Trước hết đọc/viết phần nguyên, đọc/viết dấu phẩy, sau đó đọc/viết phần thập phân.
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                setStudioTab('reading');
                sounds.playClick();
              }}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                studioTab === 'reading'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📖 Thử Thách Luyện Đọc
            </button>
            <button
              onClick={() => {
                setStudioTab('writing');
                sounds.playClick();
              }}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                studioTab === 'writing'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ✍️ Thử Thách Luyện Viết
            </button>
          </div>
        </div>

        {/* Level Filter Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Filter className="w-3 h-3 text-purple-600" />
              <span>Cấp độ:</span>
            </span>
            {[
              { id: 'all', label: `Tất cả (18)` },
              { id: 'tenths', label: 'Phần mười (6)' },
              { id: 'hundredths', label: 'Phần trăm (6)' },
              { id: 'thousandths', label: 'Phần nghìn (6)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  sounds.playClick();
                  setFilterCategory(f.id as any);
                  setCurrentIdx(0);
                  setSelectedWordTiles([]);
                  setReadingFeedback(null);
                  setWrittenInput('');
                  setWritingFeedback(null);
                }}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  filterCategory === f.id
                    ? 'bg-purple-100 text-purple-800 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Quick jump question numbers */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-slate-400 mr-0.5">Bài:</span>
            {filteredItems.map((_, i) => (
              <button
                key={i}
                onClick={() => loadQuestionByIndex(i)}
                className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer ${
                  safeIdx === i
                    ? 'bg-purple-600 text-white shadow-xs scale-105'
                    : 'bg-slate-50 hover:bg-purple-50 text-slate-600 border border-slate-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Studio Interactive Arena */}
      {studioTab === 'reading' ? (
        /* Reading Challenge */
        <div className={`grid ${isLandscape ? 'grid-cols-2 gap-3' : 'grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6'} items-start`}>
          <div className={`${isLandscape ? 'space-y-2.5 p-3' : 'lg:col-span-8 space-y-4 sm:space-y-6 p-4 sm:p-6'} bg-white rounded-2xl border border-slate-200/80 shadow-xs`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-purple-600 uppercase tracking-wider">
                Bài {safeIdx + 1} / {filteredItems.length} ({currentItem.categoryLabel})
              </span>
              <button
                onClick={nextQuestion}
                className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-purple-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Bài tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Target Number Card */}
            <div className={`${isLandscape ? 'p-2 space-y-1' : 'p-4 sm:p-6 space-y-3'} bg-slate-50 border border-slate-200 rounded-xl text-center`}>
              <div className="text-[10px] sm:text-xs text-slate-500 font-medium">
                Hãy ghép các từ bên dưới để đọc đúng số thập phân này:
              </div>
              <div className={`${isLandscape ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-6xl'} font-extrabold font-mono text-slate-900 tracking-tight`}>
                {currentItem.numberStr}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => playTTS(currentItem.readingStandard)}
                  disabled={isSpeaking}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${isLandscape ? 'text-[10px]' : 'text-xs'} font-semibold bg-purple-100 hover:bg-purple-200 text-purple-800 transition-colors cursor-pointer`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{isSpeaking ? 'Đang phát âm...' : 'Nghe đọc mẫu'}</span>
                </button>
              </div>
            </div>

            {/* Answer Assembly Drop Zone */}
            <div className="space-y-1">
              <div className="text-[11px] sm:text-xs font-semibold text-slate-700">
                Câu đọc của bạn (Bấm các thẻ bên dưới):
              </div>
              <div className={`${isLandscape ? 'min-h-[42px] p-1.5' : 'min-h-[58px] p-3'} rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/30 flex flex-wrap items-center gap-1.5`}>
                {selectedWordTiles.length === 0 ? (
                  <span className="text-[11px] sm:text-xs text-slate-400 italic">
                    Chưa có từ nào được chọn...
                  </span>
                ) : (
                  selectedWordTiles.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRemoveTile(word, idx)}
                      className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-purple-600 text-white font-semibold text-[11px] sm:text-xs rounded-lg shadow-xs hover:bg-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Bấm để gỡ từ này ra"
                    >
                      <span>{word}</span>
                      <span className="text-purple-200 text-[10px]">✕</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Available Word Bank */}
            <div className="space-y-1.5">
              <div className="text-[11px] sm:text-xs font-semibold text-slate-700">
                Kho thẻ từ ngữ:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableTiles.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTileClick(word, idx)}
                    className="px-2.5 py-1.5 bg-white hover:bg-purple-50 hover:border-purple-300 text-slate-800 font-medium text-[11px] sm:text-xs rounded-lg border border-slate-200 shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    + {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions & Feedback */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={checkReadingAnswer}
                disabled={selectedWordTiles.length === 0}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white shadow-xs transition-colors cursor-pointer"
              >
                Kiểm Tra Câu Đọc
              </button>
              <button
                onClick={() => {
                  setSelectedWordTiles([]);
                  setAvailableTiles([...currentItem.wordTiles, ...currentItem.distractorTiles].sort(() => Math.random() - 0.5));
                  setReadingFeedback(null);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Xếp lại
              </button>
            </div>

            {readingFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
                  readingFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {readingFeedback.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold mb-0.5">
                    {readingFeedback.isCorrect ? 'Tuyệt vời!' : 'Xem lại chút nhé:'}
                  </div>
                  <div>{readingFeedback.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Explanation Column */}
          <div className={`${isLandscape ? 'space-y-3' : 'lg:col-span-4 space-y-4'}`}>
            <div className={`bg-white rounded-2xl ${isLandscape ? 'p-3 sm:p-4 space-y-2' : 'p-6 space-y-3'} border border-slate-200/80 shadow-xs`}>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                💡 Góc Phân Tích Sư Phạm
              </h3>
              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  <strong>Số đang học:</strong> <span className="font-mono font-bold text-purple-700">{currentItem.numberStr}</span>
                </p>
                <div className="p-2 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div><strong>Phần nguyên:</strong> {currentItem.whole}</div>
                  <div><strong>Dấu phân cách:</strong> Dấu phẩy (,)</div>
                  <div><strong>Phần thập phân:</strong> {currentItem.decStr}</div>
                </div>
                {currentItem.placeReadingAlternative && (
                  <p className="text-slate-700">
                    <strong>Cách đọc theo hàng:</strong> &ldquo;{currentItem.placeReadingAlternative}&rdquo;.
                  </p>
                )}
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                  <strong>Mẹo nhớ:</strong> {currentItem.pitfallTip}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Writing Challenge - Optimized 2-column layout in landscape */
        <div className={`grid ${isLandscape ? 'grid-cols-2 gap-3' : 'grid-cols-1 lg:grid-cols-12 gap-6'} items-start`}>
          <div className={`${isLandscape ? 'space-y-3 p-3' : 'lg:col-span-7 space-y-6 p-6'} bg-white rounded-2xl border border-slate-200/80 shadow-xs`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-purple-600 uppercase tracking-wider">
                Bài {safeIdx + 1} / {filteredItems.length} ({currentItem.categoryLabel})
              </span>
              <button
                onClick={nextQuestion}
                className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-purple-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Bài tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Target Text Prompt */}
            <div className={`${isLandscape ? 'p-3 space-y-1.5' : 'p-5 space-y-3'} bg-purple-50/50 border border-purple-100 rounded-2xl text-center`}>
              <span className="text-[10px] sm:text-xs text-purple-700 font-semibold uppercase tracking-wider block">
                Viết số thập phân tương ứng với cách đọc:
              </span>
              <div className={`${isLandscape ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'} font-bold text-purple-950 font-sans px-1`}>
                &ldquo;{currentItem.readingStandard}&rdquo;
              </div>
              {currentItem.placeReadingAlternative && (
                <div className="text-[11px] text-purple-700 font-medium italic">
                  (Hoặc: {currentItem.placeReadingAlternative})
                </div>
              )}

              <div className="flex justify-center pt-0.5">
                <button
                  onClick={() => playTTS(currentItem.readingStandard)}
                  disabled={isSpeaking}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${isLandscape ? 'text-[10px]' : 'text-xs'} font-semibold bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors shadow-xs cursor-pointer`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{isSpeaking ? 'Đang đọc...' : 'Nghe đọc câu hỏi'}</span>
                </button>
              </div>
            </div>

            {/* Display Input Area */}
            <div className="space-y-1">
              <div className="text-[11px] sm:text-xs font-semibold text-slate-700">
                Số thập phân bạn viết:
              </div>
              <div className={`${isLandscape ? 'p-2 min-h-[48px]' : 'p-4 min-h-[64px]'} bg-slate-50 border border-slate-300 rounded-xl text-center flex items-center justify-center`}>
                <span className={`${isLandscape ? 'text-3xl' : 'text-4xl'} font-mono font-extrabold text-slate-900 tracking-wider`}>
                  {writtenInput || <span className="text-slate-300 font-normal text-xl font-sans">Bấm phím bên dưới...</span>}
                </span>
              </div>
            </div>

            {/* Submit & Reset Buttons in Landscape Left Column */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={checkWritingAnswer}
                disabled={!writtenInput}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white shadow-xs transition-colors cursor-pointer"
              >
                Kiểm Tra Viết Số
              </button>
              <button
                onClick={() => handleKeypadPress('clear')}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>

            {writingFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
                  writingFeedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {writingFeedback.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold mb-0.5">
                    {writingFeedback.isCorrect ? 'Rất giỏi!' : 'Cần lưu ý:'}
                  </div>
                  <div>{writingFeedback.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Keypad on Landscape (or hint card below keypad on portrait) */}
          <div className={`${isLandscape ? 'space-y-3' : 'lg:col-span-5 space-y-4'}`}>
            {/* Math Decimal Virtual Keypad */}
            <div className={`bg-white rounded-2xl ${isLandscape ? 'p-3' : 'p-5'} border border-slate-200/80 shadow-xs space-y-2`}>
              <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                <span>Bàn phím số thập phân:</span>
                <span className="text-[10px] text-slate-400">Bấm phím để nhập số</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 max-w-sm mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    onClick={() => handleKeypadPress(num)}
                    className={`${isLandscape ? 'py-2 text-lg min-h-[38px]' : 'py-3.5 sm:py-3 text-xl sm:text-lg min-h-[48px]'} font-bold font-mono active:scale-95 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl shadow-xs text-slate-800 transition-all cursor-pointer`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => handleKeypadPress(',')}
                  className={`${isLandscape ? 'py-2 text-xl min-h-[38px]' : 'py-3.5 sm:py-3 text-2xl min-h-[48px]'} font-black font-mono active:scale-95 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl shadow-xs transition-all cursor-pointer`}
                  title="Dấu phẩy phân cách"
                >
                  ,
                </button>
                <button
                  onClick={() => handleKeypadPress('0')}
                  className={`${isLandscape ? 'py-2 text-lg min-h-[38px]' : 'py-3.5 sm:py-3 text-xl sm:text-lg min-h-[48px]'} font-bold font-mono active:scale-95 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl shadow-xs text-slate-800 transition-all cursor-pointer`}
                >
                  0
                </button>
                <button
                  onClick={() => handleKeypadPress('backspace')}
                  className={`${isLandscape ? 'py-2 min-h-[38px]' : 'py-3.5 sm:py-3 min-h-[48px]'} flex items-center justify-center active:scale-95 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl shadow-xs transition-all cursor-pointer`}
                  title="Xóa 1 ký tự"
                >
                  <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Hint Tip */}
            <div className={`bg-white rounded-2xl ${isLandscape ? 'p-3 space-y-1.5' : 'p-6 space-y-3'} border border-slate-200/80 shadow-xs`}>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                <span>Mẹo Viết Số Thập Phân Chuẩn</span>
              </h3>
              <div className="text-[11px] sm:text-xs text-slate-600 space-y-1 leading-relaxed">
                <p>
                  <strong>Bước 1:</strong> Viết phần nguyên (trước dấu &ldquo;phẩy&rdquo;).
                </p>
                <p>
                  <strong>Bước 2:</strong> Viết dấu phẩy (,).
                </p>
                <p>
                  <strong>Bước 3:</strong> Viết phần thập phân (phần mười ➔ phần trăm ➔ phần nghìn).
                </p>
                <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 text-[11px]">
                  <strong>Ví dụ:</strong> &ldquo;tám phẩy không sáu&rdquo; ➔ viết <span className="font-mono font-bold">8,06</span> (có số 0 ở hàng phần mười).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
