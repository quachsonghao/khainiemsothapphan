import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Volume2, Star, CheckCircle, XCircle, ArrowRight, RotateCcw, Award, Sparkles, HelpCircle, ChevronRight } from 'lucide-react';
import { sounds } from '../utils/audio';
import { speakVietnamese } from '../utils/vietnameseNumberReader';
import { Fraction } from './Fraction';
import confetti from 'canvas-confetti';
import { useOrientation } from '../context/OrientationContext';

interface GameArenaProps {
  onEarnStar?: (count?: number) => void;
  totalStars: number;
  onNavigateToPlaceMatch?: () => void;
}

type MiniGameMode = 'place-hunter' | 'magic-pairs' | 'listen-shoot' | 'real-world';

interface QuestionOption {
  label?: string;
  isFraction?: boolean;
  num?: number;
  den?: number;
  whole?: number;
  rawVal: string;
}

interface QuestionItem {
  id: string;
  title: string;
  prompt: string;
  contextNum?: string;
  audioSpeak?: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
}

// 16 PLACE HUNTER QUESTIONS
const PLACE_HUNTER_QUESTIONS: QuestionItem[] = [
  {
    id: 'ph1',
    title: 'Hàng phần trăm',
    prompt: 'Trong số thập phân 64,289, chữ số nào ở hàng phần trăm?',
    contextNum: '64,289',
    options: [{ rawVal: '4', label: '4' }, { rawVal: '2', label: '2' }, { rawVal: '8', label: '8' }, { rawVal: '9', label: '9' }],
    correctAnswer: '8',
    explanation: 'Chữ số 8 đứng ở vị trí thứ hai sau dấu phẩy, thuộc hàng phần trăm (có giá trị là 0,08).'
  },
  {
    id: 'ph2',
    title: 'Giá trị của chữ số',
    prompt: 'Trong số thập phân 51,784, chữ số 7 có giá trị là bao nhiêu?',
    contextNum: '51,784',
    options: [
      { rawVal: '7', label: '7 đơn vị' },
      { rawVal: '7/10', isFraction: true, num: 7, den: 10 },
      { rawVal: '7/100', isFraction: true, num: 7, den: 100 },
      { rawVal: '7/1000', isFraction: true, num: 7, den: 1000 }
    ],
    correctAnswer: '7/10',
    explanation: 'Chữ số 7 đứng ngay sau dấu phẩy thuộc hàng phần mười, nên có giá trị là 7 phần 10 (0,7).'
  },
  {
    id: 'ph3',
    title: 'Xác định hàng phần nghìn',
    prompt: 'Trong số 0,305, chữ số 5 thuộc hàng nào?',
    contextNum: '0,305',
    options: [
      { rawVal: 'Hàng đơn vị', label: 'Hàng đơn vị' },
      { rawVal: 'Hàng phần mười', label: 'Hàng phần mười' },
      { rawVal: 'Hàng phần trăm', label: 'Hàng phần trăm' },
      { rawVal: 'Hàng phần nghìn', label: 'Hàng phần nghìn' }
    ],
    correctAnswer: 'Hàng phần nghìn',
    explanation: 'Chữ số 5 đứng ở vị trí thứ ba bên phải dấu phẩy, thuộc hàng phần nghìn (giá trị là 5 phần 1000 hay 0,005).'
  },
  {
    id: 'ph4',
    title: 'Phần nguyên và phần thập phân',
    prompt: 'Số 158,42 gồm phần nguyên là bao nhiêu và phần thập phân là bao nhiêu?',
    contextNum: '158,42',
    options: [
      { rawVal: '158-42', label: 'Phần nguyên: 158; Phần thập phân: 42' },
      { rawVal: '42-158', label: 'Phần nguyên: 42; Phần thập phân: 158' },
      { rawVal: '1-58,42', label: 'Phần nguyên: 1; Phần thập phân: 58,42' },
      { rawVal: '15-8,42', label: 'Phần nguyên: 15; Phần thập phân: 8,42' }
    ],
    correctAnswer: '158-42',
    explanation: 'Bên trái dấu phẩy là phần nguyên (158), bên phải dấu phẩy là phần thập phân (42).'
  },
  {
    id: 'ph5',
    title: 'Chữ số 0 ở hàng phần mười',
    prompt: 'Trong số 9,06, chữ số 0 thuộc hàng nào?',
    contextNum: '9,06',
    options: [
      { rawVal: 'Hàng đơn vị', label: 'Hàng đơn vị' },
      { rawVal: 'Hàng phần mười', label: 'Hàng phần mười' },
      { rawVal: 'Hàng phần trăm', label: 'Hàng phần trăm' },
      { rawVal: 'Không có giá trị', label: 'Không có giá trị' }
    ],
    correctAnswer: 'Hàng phần mười',
    explanation: 'Chữ số 0 đứng ở hàng phần mười giúp giữ chỗ, để chữ số 6 nằm đúng hàng phần trăm.'
  },
  {
    id: 'ph6',
    title: 'Giá trị hàng phần trăm',
    prompt: 'Trong số 14,258, chữ số 5 có giá trị là bao nhiêu?',
    contextNum: '14,258',
    options: [
      { rawVal: '5/10', isFraction: true, num: 5, den: 10 },
      { rawVal: '5/100', isFraction: true, num: 5, den: 100 },
      { rawVal: '5/1000', isFraction: true, num: 5, den: 1000 },
      { rawVal: '50', label: '50 đơn vị' }
    ],
    correctAnswer: '5/100',
    explanation: 'Chữ số 5 ở hàng phần trăm nên có giá trị là 5 phần 100.'
  },
  {
    id: 'ph7',
    title: 'Hàng chục vs Hàng phần mười',
    prompt: 'Trong số 32,35, hai chữ số 3 lần lượt thuộc các hàng nào?',
    contextNum: '32,35',
    options: [
      { rawVal: 'A', label: 'Hàng chục và Hàng phần mười' },
      { rawVal: 'B', label: 'Hàng trăm và Hàng phần trăm' },
      { rawVal: 'C', label: 'Hàng đơn vị và Hàng phần mười' },
      { rawVal: 'D', label: 'Cả hai đều ở hàng chục' }
    ],
    correctAnswer: 'A',
    explanation: 'Chữ số 3 đầu tiên ở hàng chục (30), chữ số 3 thứ hai ở hàng phần mười (0,3).'
  },
  {
    id: 'ph8',
    title: 'Xác định số có phần mười bằng 0',
    prompt: 'Số thập phân nào dưới đây có chữ số hàng phần mười bằng 0?',
    options: [
      { rawVal: 'A', label: '12,05' },
      { rawVal: 'B', label: '12,50' },
      { rawVal: 'C', label: '1,25' },
      { rawVal: 'D', label: '125,0' }
    ],
    correctAnswer: 'A',
    explanation: 'Số 12,05 có chữ số 0 đứng ngay sau dấu phẩy (hàng phần mười).'
  },
  {
    id: 'ph9',
    title: 'Phân tích cấu tạo hàng',
    prompt: 'Số gồm 7 trăm, 2 đơn vị và 4 phần nghìn được viết là:',
    options: [
      { rawVal: 'A', label: '702,004' },
      { rawVal: 'B', label: '72,4' },
      { rawVal: 'C', label: '702,4' },
      { rawVal: 'D', label: '720,04' }
    ],
    correctAnswer: 'A',
    explanation: 'Phần nguyên là 702; hàng phần mười là 0, hàng phần trăm là 0, hàng phần nghìn là 4: viết là 702,004.'
  },
  {
    id: 'ph10',
    title: 'Soi vị trí hàng',
    prompt: 'Chữ số 9 trong số 0,089 nằm ở hàng nào?',
    contextNum: '0,089',
    options: [
      { rawVal: 'A', label: 'Hàng phần mười' },
      { rawVal: 'B', label: 'Hàng phần trăm' },
      { rawVal: 'C', label: 'Hàng phần nghìn' },
      { rawVal: 'D', label: 'Hàng chục' }
    ],
    correctAnswer: 'C',
    explanation: 'Chữ số 9 đứng ở vị trí thứ ba sau dấu phẩy, thuộc hàng phần nghìn.'
  },
  {
    id: 'ph11',
    title: 'Mối quan hệ các hàng',
    prompt: '1 phần mười bằng bao nhiêu phần trăm?',
    options: [
      { rawVal: 'A', label: '10 phần trăm' },
      { rawVal: 'B', label: '100 phần trăm' },
      { rawVal: 'C', label: '1 phần trăm' },
      { rawVal: 'D', label: '2 phần trăm' }
    ],
    correctAnswer: 'A',
    explanation: 'Mỗi đơn vị của một hàng gấp 10 lần đơn vị của hàng thấp hơn liền sau: 1 phần mười = 10 phần trăm (0,1 = 0,10).'
  },
  {
    id: 'ph12',
    title: 'Giá trị chữ số ở hàng phần nghìn',
    prompt: 'Trong số 18,206, giá trị của chữ số 6 là:',
    contextNum: '18,206',
    options: [
      { rawVal: 'A', isFraction: true, num: 6, den: 1000 },
      { rawVal: 'B', isFraction: true, num: 6, den: 100 },
      { rawVal: 'C', isFraction: true, num: 6, den: 10 },
      { rawVal: 'D', label: '6 đơn vị' }
    ],
    correctAnswer: 'A',
    explanation: 'Chữ số 6 ở hàng phần nghìn nên có giá trị là 6 phần 1000.'
  },
  {
    id: 'ph13',
    title: 'Số các chữ số thập phân',
    prompt: 'Số thập phân 3,1415 có bao nhiêu chữ số ở phần thập phân?',
    contextNum: '3,1415',
    options: [
      { rawVal: '1', label: '1 chữ số' },
      { rawVal: '3', label: '3 chữ số' },
      { rawVal: '4', label: '4 chữ số' },
      { rawVal: '5', label: '5 chữ số' }
    ],
    correctAnswer: '4',
    explanation: 'Phần thập phân là 1415 gồm 4 chữ số: 1, 4, 1 và 5.'
  },
  {
    id: 'ph14',
    title: 'Cấu tạo số thập phân',
    prompt: 'Chữ số phân cách giữa phần nguyên và phần thập phân được gọi là:',
    options: [
      { rawVal: 'A', label: 'Dấu phẩy (,)' },
      { rawVal: 'B', label: 'Dấu chấm (.)' },
      { rawVal: 'C', label: 'Dấu gạch ngang (-)' },
      { rawVal: 'D', label: 'Dấu cộng (+)' }
    ],
    correctAnswer: 'A',
    explanation: 'Theo chuẩn sách giáo khoa Việt Nam, phần nguyên và phần thập phân được ngăn cách bởi dấu phẩy (,).'
  },
  {
    id: 'ph15',
    title: 'Giá trị lớn nhất của chữ số phần mười',
    prompt: 'Trong một số thập phân, chữ số ở hàng phần mười có thể nhận giá trị lớn nhất là bao nhiêu?',
    options: [
      { rawVal: '9', label: '9' },
      { rawVal: '10', label: '10' },
      { rawVal: '1', label: '1' },
      { rawVal: '99', label: '99' }
    ],
    correctAnswer: '9',
    explanation: 'Mỗi hàng chỉ chứa một chữ số từ 0 đến 9. Khi đủ 10 phần mười thì chuyển thành 1 đơn vị.'
  },
  {
    id: 'ph16',
    title: 'Phân tích tổng',
    prompt: 'Biểu thức 20 + 5 + 0,4 + 0,08 tương ứng với số thập phân nào?',
    options: [
      { rawVal: 'A', label: '25,48' },
      { rawVal: 'B', label: '25,84' },
      { rawVal: 'C', label: '205,48' },
      { rawVal: 'D', label: '25,408' }
    ],
    correctAnswer: 'A',
    explanation: '20 + 5 = 25 (phần nguyên); 0,4 + 0,08 = 0,48 (phần thập phân) ➔ 25,48.'
  }
];

// 12 LISTEN & SHOOT QUESTIONS
const LISTEN_SHOOT_QUESTIONS: QuestionItem[] = [
  {
    id: 'ls1',
    title: 'Nghe và nhận diện',
    prompt: 'Hãy bấm nghe âm thanh rồi chọn đúng số thập phân được đọc:',
    audioSpeak: 'Mười lăm phẩy không tám',
    options: [{ rawVal: '15,8', label: '15,8' }, { rawVal: '15,08', label: '15,08' }, { rawVal: '15,80', label: '15,80' }, { rawVal: '1,508', label: '1,508' }],
    correctAnswer: '15,08',
    explanation: '"Mười lăm phẩy không tám" có chữ số 0 ở hàng phần mười và chữ số 8 ở hàng phần trăm: 15,08.'
  },
  {
    id: 'ls2',
    title: 'Nghe và nhận diện',
    prompt: 'Bấm nghe âm thanh rồi chọn số thập phân tương ứng:',
    audioSpeak: 'Bảy đơn vị, ba mươi lăm phần trăm',
    options: [{ rawVal: '7,35', label: '7,35' }, { rawVal: '7,035', label: '7,035' }, { rawVal: '73,5', label: '73,5' }, { rawVal: '0,735', label: '0,735' }],
    correctAnswer: '7,35',
    explanation: '"Bảy đơn vị" là phần nguyên 7; "ba mươi lăm phần trăm" là 35 ở phần thập phân: 7,35.'
  },
  {
    id: 'ls3',
    title: 'Nghe và nhận diện',
    prompt: 'Bấm nghe âm thanh rồi chọn số thập phân tương ứng:',
    audioSpeak: 'Không phẩy không không bảy',
    options: [{ rawVal: '0,7', label: '0,7' }, { rawVal: '0,07', label: '0,07' }, { rawVal: '0,007', label: '0,007' }, { rawVal: '7,000', label: '7,000' }],
    correctAnswer: '0,007',
    explanation: 'Có 2 chữ số 0 trước chữ số 7, số 7 ở hàng phần nghìn: 0,007.'
  },
  {
    id: 'ls4',
    title: 'Nghe và nhận diện',
    prompt: 'Bấm nghe âm thanh rồi chọn số thập phân tương ứng:',
    audioSpeak: 'Bốn mươi tư phẩy tư',
    options: [{ rawVal: '4,4', label: '4,4' }, { rawVal: '44,4', label: '44,4' }, { rawVal: '44,04', label: '44,04' }, { rawVal: '40,4', label: '40,4' }],
    correctAnswer: '44,4',
    explanation: '"Bốn mươi tư" là phần nguyên (44), dấu phẩy, "tư" là 4 ở hàng phần mười: 44,4.'
  },
  {
    id: 'ls5',
    title: 'Nghe và nhận diện',
    prompt: 'Bấm nghe âm thanh rồi chọn số thập phân tương ứng:',
    audioSpeak: 'Chín phẩy bốn trăm linh năm',
    options: [{ rawVal: '9,45', label: '9,45' }, { rawVal: '9,405', label: '9,405' }, { rawVal: '9,045', label: '9,045' }, { rawVal: '94,05', label: '94,05' }],
    correctAnswer: '9,405',
    explanation: '"Chín" (9), phẩy, "bốn trăm linh năm" (405) ➔ 9,405.'
  },
  {
    id: 'ls6',
    title: 'Nghe và nhận diện',
    prompt: 'Bấm nghe âm thanh rồi chọn số thập phân tương ứng:',
    audioSpeak: 'Không phẩy hai mươi lăm',
    options: [{ rawVal: '0,25', label: '0,25' }, { rawVal: '0,205', label: '0,205' }, { rawVal: '2,5', label: '2,5' }, { rawVal: '0,52', label: '0,52' }],
    correctAnswer: '0,25',
    explanation: 'Phần nguyên là 0, phần thập phân là hai mươi lăm: 0,25.'
  },
  {
    id: 'ls7',
    title: 'Nghe và nhận diện',
    prompt: 'Bấm nghe âm thanh rồi chọn số thập phân tương ứng:',
    audioSpeak: 'Mười hai đơn vị, bốn phần mười',
    options: [{ rawVal: '12,4', label: '12,4' }, { rawVal: '12,04', label: '12,04' }, { rawVal: '1,24', label: '1,24' }, { rawVal: '12,400', label: '12,400' }],
    correctAnswer: '12,4',
    explanation: '12 đơn vị (phần nguyên), 4 phần mười (ngay sau dấu phẩy): 12,4.'
  },
  {
    id: 'ls8',
    title: 'Nghe và nhận diện',
    prompt: 'Bấm nghe âm thanh rồi chọn số thập phân tương ứng:',
    audioSpeak: 'Một trăm linh tám phẩy không sáu',
    options: [{ rawVal: '108,6', label: '108,6' }, { rawVal: '108,06', label: '108,06' }, { rawVal: '18,06', label: '18,06' }, { rawVal: '108,60', label: '108,60' }],
    correctAnswer: '108,06',
    explanation: 'Phần nguyên là 108, phần thập phân là 06: 108,06.'
  },
  {
    id: 'ls9',
    title: 'Nghe và nhận diện',
    prompt: 'Bấm nghe âm thanh rồi chọn số thập phân tương ứng:',
    audioSpeak: 'Năm mươi phẩy không không năm',
    options: [{ rawVal: '50,5', label: '50,5' }, { rawVal: '50,05', label: '50,05' }, { rawVal: '50,005', label: '50,005' }, { rawVal: '5,005', label: '5,005' }],
    correctAnswer: '50,005',
    explanation: '50 phẩy không không năm có hai chữ số 0 ở hàng phần mười và phần trăm: 50,005.'
  },
  {
    id: 'ls10',
    title: 'Nghe và nhận diện',
    prompt: 'Bấm nghe âm thanh rồi chọn số thập phân tương ứng:',
    audioSpeak: 'Ba mươi tư phẩy sáu mươi bảy',
    options: [{ rawVal: '34,67', label: '34,67' }, { rawVal: '34,76', label: '34,76' }, { rawVal: '43,67', label: '43,67' }, { rawVal: '3,467', label: '3,467' }],
    correctAnswer: '34,67',
    explanation: 'Ba mươi tư (34), sáu mươi bảy (67) ➔ 34,67.'
  },
  {
    id: 'ls11',
    title: 'Nghe và nhận diện',
    prompt: 'Bấm nghe âm thanh rồi chọn số thập phân tương ứng:',
    audioSpeak: 'Không phẩy một trăm hai mươi lăm',
    options: [{ rawVal: '0,125', label: '0,125' }, { rawVal: '0,25', label: '0,25' }, { rawVal: '1,25', label: '1,25' }, { rawVal: '0,152', label: '0,152' }],
    correctAnswer: '0,125',
    explanation: 'Phần nguyên là 0, phần thập phân là 125 (hàng phần nghìn): 0,125.'
  },
  {
    id: 'ls12',
    title: 'Nghe và nhận diện',
    prompt: 'Bấm nghe âm thanh rồi chọn số thập phân tương ứng:',
    audioSpeak: 'Tám mươi tám phẩy tám',
    options: [{ rawVal: '88,8', label: '88,8' }, { rawVal: '8,88', label: '8,88' }, { rawVal: '88,08', label: '88,08' }, { rawVal: '888', label: '888' }],
    correctAnswer: '88,8',
    explanation: 'Tám mươi tám (88), phẩy tám (8) ➔ 88,8.'
  }
];

// 12 REAL WORLD QUESTIONS
const REAL_WORLD_QUESTIONS: QuestionItem[] = [
  {
    id: 'rw1',
    title: 'Đo lường thể tích lít',
    prompt: 'Một chai nước chứa 1 lít và 500 ml nước. Viết số đo này dưới dạng số thập phân có đơn vị là lít?',
    options: [{ rawVal: '1,5 lít', label: '1,5 lít' }, { rawVal: '1,05 lít', label: '1,05 lít' }, { rawVal: '15 lít', label: '15 lít' }, { rawVal: '0,15 lít', label: '0,15 lít' }],
    correctAnswer: '1,5 lít',
    explanation: 'Vì 1 lít = 1000 ml nên 500 ml = 5/10 lít = 0,5 lít. Vậy 1l 500ml = 1,5 lít.'
  },
  {
    id: 'rw2',
    title: 'Đo chiều dài mét',
    prompt: 'Một mảnh vải dài 2 mét 35 xăng-ti-mét. Viết số đo dưới dạng số thập phân có đơn vị mét?',
    options: [{ rawVal: '2,35 m', label: '2,35 m' }, { rawVal: '2,035 m', label: '2,035 m' }, { rawVal: '23,5 m', label: '23,5 m' }, { rawVal: '235 m', label: '235 m' }],
    correctAnswer: '2,35 m',
    explanation: '1 m = 100 cm nên 35 cm = 35 phần trăm mét = 0,35 m. Vậy 2 m 35 cm = 2,35 m.'
  },
  {
    id: 'rw3',
    title: 'Đo khối lượng ki-lô-gam',
    prompt: 'Quả dưa hấu cân nặng 3 ki-lô-gam 75 gam. Viết theo đơn vị ki-lô-gam là bao nhiêu?',
    options: [{ rawVal: '3,75 kg', label: '3,75 kg' }, { rawVal: '3,075 kg', label: '3,075 kg' }, { rawVal: '3,750 kg', label: '3,750 kg' }, { rawVal: '37,5 kg', label: '37,5 kg' }],
    correctAnswer: '3,075 kg',
    explanation: '1 kg = 1000 g nên 75 g = 75 phần nghìn kg = 0,075 kg. Do đó 3 kg 75 g = 3,075 kg.'
  },
  {
    id: 'rw4',
    title: 'Đổi độ dài đề-xi-mét sang mét',
    prompt: 'Một sợi dây dài 4 đề-xi-mét. Viết theo đơn vị mét là bao nhiêu?',
    options: [{ rawVal: '4,0 m', label: '4,0 m' }, { rawVal: '0,4 m', label: '0,4 m' }, { rawVal: '0,04 m', label: '0,04 m' }, { rawVal: '40 m', label: '40 m' }],
    correctAnswer: '0,4 m',
    explanation: '1 m = 10 dm nên 4 dm = 4 phần mười mét = 0,4 mét.'
  },
  {
    id: 'rw5',
    title: 'Đo chiều dài xăng-ti-mét sang mét',
    prompt: 'Chiều rộng cuốn sách là 18 cm. Viết theo đơn vị mét là bao nhiêu?',
    options: [{ rawVal: '0,18 m', label: '0,18 m' }, { rawVal: '1,8 m', label: '1,8 m' }, { rawVal: '0,018 m', label: '0,018 m' }, { rawVal: '18 m', label: '18 m' }],
    correctAnswer: '0,18 m',
    explanation: '1 m = 100 cm nên 18 cm = 18 phần trăm mét = 0,18 m.'
  },
  {
    id: 'rw6',
    title: 'Khối lượng tấn và tạ',
    prompt: 'Một chiếc xe tải chở 4 tấn 5 tạ hàng. Viết theo đơn vị tấn là bao nhiêu?',
    options: [{ rawVal: '4,5 tấn', label: '4,5 tấn' }, { rawVal: '4,05 tấn', label: '4,05 tấn' }, { rawVal: '45 tấn', label: '45 tấn' }, { rawVal: '0,45 tấn', label: '0,45 tấn' }],
    correctAnswer: '4,5 tấn',
    explanation: '1 tấn = 10 tạ nên 5 tạ = 5 phần mười tấn = 0,5 tấn. Vậy 4 tấn 5 tạ = 4,5 tấn.'
  },
  {
    id: 'rw7',
    title: 'Đo độ dày mi-li-mét sang xăng-ti-mét',
    prompt: 'Độ dày của tấm kính là 8 mm. Viết theo đơn vị cm là bao nhiêu?',
    options: [{ rawVal: '0,8 cm', label: '0,8 cm' }, { rawVal: '0,08 cm', label: '0,08 cm' }, { rawVal: '8 cm', label: '8 cm' }, { rawVal: '80 cm', label: '80 cm' }],
    correctAnswer: '0,8 cm',
    explanation: '1 cm = 10 mm nên 8 mm = 8 phần mười cm = 0,8 cm.'
  },
  {
    id: 'rw8',
    title: 'Khối lượng gam sang ki-lô-gam',
    prompt: 'Một gói kẹo nặng 250 g. Viết theo đơn vị kg là bao nhiêu?',
    options: [{ rawVal: '0,25 kg', label: '0,25 kg' }, { rawVal: '2,5 kg', label: '2,5 kg' }, { rawVal: '0,025 kg', label: '0,025 kg' }, { rawVal: '25 kg', label: '25 kg' }],
    correctAnswer: '0,25 kg',
    explanation: '250 g = 250 phần nghìn kg = 25 phần trăm kg = 0,25 kg.'
  },
  {
    id: 'rw9',
    title: 'Độ dài mét và mi-li-mét',
    prompt: 'Một thanh sắt dài 5 mét 6 mi-li-mét. Viết theo đơn vị mét là:',
    options: [{ rawVal: '5,006 m', label: '5,006 m' }, { rawVal: '5,6 m', label: '5,6 m' }, { rawVal: '5,06 m', label: '5,06 m' }, { rawVal: '56 m', label: '56 m' }],
    correctAnswer: '5,006 m',
    explanation: '1 m = 1000 mm nên 6 mm = 6 phần nghìn m = 0,006 m. Vậy 5 m 6 mm = 5,006 m.'
  },
  {
    id: 'rw10',
    title: 'Thể tích lít và mi-li-lít',
    prompt: 'Bình sữa của em bé có 250 ml sữa. Viết số lít sữa là:',
    options: [{ rawVal: '0,25 l', label: '0,25 lít' }, { rawVal: '2,5 l', label: '2,5 lít' }, { rawVal: '0,025 l', label: '0,025 lít' }, { rawVal: '25 l', label: '25 lít' }],
    correctAnswer: '0,25 l',
    explanation: '250 ml = 250 phần nghìn lít = 0,25 lít.'
  },
  {
    id: 'rw11',
    title: 'Diện tích mét vuông và đề-xi-mét vuông',
    prompt: 'Một mặt bàn có diện tích 1 mét vuông 25 đề-xi-mét vuông. Viết theo mét vuông là:',
    options: [{ rawVal: '1,25 m²', label: '1,25 m²' }, { rawVal: '1,025 m²', label: '1,025 m²' }, { rawVal: '12,5 m²', label: '12,5 m²' }, { rawVal: '125 m²', label: '125 m²' }],
    correctAnswer: '1,25 m²',
    explanation: '1 m² = 100 dm² nên 25 dm² = 25 phần trăm m² = 0,25 m². Vậy 1 m² 25 dm² = 1,25 m².'
  },
  {
    id: 'rw12',
    title: 'Khối lượng tấn và ki-lô-gam',
    prompt: 'Con voi nặng 2 tấn 450 kg. Viết khối lượng con voi theo đơn vị tấn là:',
    options: [{ rawVal: '2,45 tấn', label: '2,45 tấn' }, { rawVal: '2,045 tấn', label: '2,045 tấn' }, { rawVal: '24,5 tấn', label: '24,5 tấn' }, { rawVal: '245 tấn', label: '245 tấn' }],
    correctAnswer: '2,45 tấn',
    explanation: '1 tấn = 1000 kg nên 450 kg = 0,45 tấn. Vậy 2 tấn 450 kg = 2,45 tấn.'
  }
];

// MAGIC PAIRS 4 ROUNDS (24 PAIRS IN TOTAL)
interface PairSource {
  round: number;
  pairId: number;
  fractionNum: number;
  fractionDen: number;
  fractionWhole?: number;
  decimal: string;
  label: string;
}

const ALL_PAIR_ROUNDS: Record<number, { title: string; pairs: PairSource[] }> = {
  1: {
    title: 'Màn 1: Phân số thập phân hàng phần mười',
    pairs: [
      { round: 1, pairId: 1, fractionNum: 1, fractionDen: 10, decimal: '0,1', label: '1 phần mười' },
      { round: 1, pairId: 2, fractionNum: 3, fractionDen: 10, decimal: '0,3', label: '3 phần mười' },
      { round: 1, pairId: 3, fractionNum: 5, fractionDen: 10, decimal: '0,5', label: '5 phần mười (một nửa)' },
      { round: 1, pairId: 4, fractionNum: 7, fractionDen: 10, decimal: '0,7', label: '7 phần mười' },
      { round: 1, pairId: 5, fractionNum: 9, fractionDen: 10, decimal: '0,9', label: '9 phần mười' },
      { round: 1, pairId: 6, fractionNum: 10, fractionDen: 10, decimal: '1,0', label: '10 phần mười = 1 đơn vị' }
    ]
  },
  2: {
    title: 'Màn 2: Phân số thập phân hàng phần trăm',
    pairs: [
      { round: 2, pairId: 7, fractionNum: 25, fractionDen: 100, decimal: '0,25', label: '25 phần trăm (1/4)' },
      { round: 2, pairId: 8, fractionNum: 50, fractionDen: 100, decimal: '0,5', label: '50 phần trăm = 5/10' },
      { round: 2, pairId: 9, fractionNum: 75, fractionDen: 100, decimal: '0,75', label: '75 phần trăm (3/4)' },
      { round: 2, pairId: 10, fractionNum: 8, fractionDen: 100, decimal: '0,08', label: '8 phần trăm' },
      { round: 2, pairId: 11, fractionNum: 60, fractionDen: 100, decimal: '0,6', label: '60 phần trăm = 6/10' },
      { round: 2, pairId: 12, fractionNum: 99, fractionDen: 100, decimal: '0,99', label: '99 phần trăm' }
    ]
  },
  3: {
    title: 'Màn 3: Phân số thập phân hàng phần nghìn',
    pairs: [
      { round: 3, pairId: 13, fractionNum: 125, fractionDen: 1000, decimal: '0,125', label: '125 phần nghìn (1/8)' },
      { round: 3, pairId: 14, fractionNum: 5, fractionDen: 1000, decimal: '0,005', label: '5 phần nghìn' },
      { round: 3, pairId: 15, fractionNum: 75, fractionDen: 1000, decimal: '0,075', label: '75 phần nghìn' },
      { round: 3, pairId: 16, fractionNum: 500, fractionDen: 1000, decimal: '0,5', label: '500 phần nghìn = 0,5' },
      { round: 3, pairId: 17, fractionNum: 250, fractionDen: 1000, decimal: '0,25', label: '250 phần nghìn = 0,25' },
      { round: 3, pairId: 18, fractionNum: 7, fractionDen: 1000, decimal: '0,007', label: '7 phần nghìn' }
    ]
  },
  4: {
    title: 'Màn 4: Hỗn số và số thập phân',
    pairs: [
      { round: 4, pairId: 19, fractionNum: 3, fractionDen: 10, fractionWhole: 1, decimal: '1,3', label: '1 đơn vị và 3 phần mười' },
      { round: 4, pairId: 20, fractionNum: 5, fractionDen: 10, fractionWhole: 2, decimal: '2,5', label: '2 đơn vị và 5 phần mười' },
      { round: 4, pairId: 21, fractionNum: 25, fractionDen: 100, fractionWhole: 3, decimal: '3,25', label: '3 đơn vị và 25 phần trăm' },
      { round: 4, pairId: 22, fractionNum: 75, fractionDen: 100, fractionWhole: 1, decimal: '1,75', label: '1 đơn vị và 75 phần trăm' },
      { round: 4, pairId: 23, fractionNum: 8, fractionDen: 100, fractionWhole: 4, decimal: '4,08', label: '4 đơn vị và 8 phần trăm' },
      { round: 4, pairId: 24, fractionNum: 125, fractionDen: 1000, fractionWhole: 2, decimal: '2,125', label: '2 đơn vị và 125 phần nghìn' }
    ]
  }
};

interface CardPair {
  id: string;
  pairId: number;
  fractionNum?: number;
  fractionDen?: number;
  fractionWhole?: number;
  decimalText?: string;
  subText?: string;
  type: 'fraction' | 'decimal';
}

export const GameArena: React.FC<GameArenaProps> = ({ onEarnStar, totalStars, onNavigateToPlaceMatch }) => {
  const { isLandscape } = useOrientation();
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameMode>('place-hunter');

  // Gamification states
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);

  // Question State for standard quizzes
  const [currentQIdx, setCurrentQIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Magic Pairs Game State
  const [pairRound, setPairRound] = useState<number>(1);
  const [cards, setCards] = useState<CardPair[]>([]);
  const [selectedCard1, setSelectedCard1] = useState<CardPair | null>(null);
  const [selectedCard2, setSelectedCard2] = useState<CardPair | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);

  // Current questions list
  const getQuestionsList = () => {
    switch (activeMiniGame) {
      case 'place-hunter':
        return PLACE_HUNTER_QUESTIONS;
      case 'listen-shoot':
        return LISTEN_SHOOT_QUESTIONS;
      case 'real-world':
        return REAL_WORLD_QUESTIONS;
      default:
        return PLACE_HUNTER_QUESTIONS;
    }
  };

  const currentQuestions = getQuestionsList();
  const currentQuestion = currentQuestions[currentQIdx % currentQuestions.length];

  // Initialize magic pairs with standard fraction representation
  const initMagicPairs = (roundNum: number = pairRound) => {
    const roundData = ALL_PAIR_ROUNDS[roundNum] || ALL_PAIR_ROUNDS[1];
    const list: CardPair[] = [];

    roundData.pairs.forEach((p) => {
      list.push({
        id: `f-${p.pairId}`,
        pairId: p.pairId,
        fractionNum: p.fractionNum,
        fractionDen: p.fractionDen,
        fractionWhole: p.fractionWhole,
        subText: p.fractionWhole ? 'Hỗn số' : 'Phân số thập phân',
        type: 'fraction'
      });
      list.push({
        id: `d-${p.pairId}`,
        pairId: p.pairId,
        decimalText: p.decimal,
        subText: p.label,
        type: 'decimal'
      });
    });

    setCards(list.sort(() => Math.random() - 0.5));
    setSelectedCard1(null);
    setSelectedCard2(null);
    setMatchedPairs([]);
  };

  useEffect(() => {
    if (activeMiniGame === 'magic-pairs') {
      initMagicPairs(pairRound);
    }
    // Reset question idx on tab switch
    setCurrentQIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
  }, [activeMiniGame, pairRound]);

  const handleSelectOption = (rawVal: string) => {
    if (isSubmitted) return;
    sounds.playClick();
    setSelectedOption(rawVal);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isSubmitted) return;
    setIsSubmitted(true);

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) {
      sounds.playSuccess();
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      const addedScore = 100 + (newStreak > 1 ? (newStreak - 1) * 20 : 0);
      setScore(prev => prev + addedScore);

      if (onEarnStar) {
        onEarnStar(1);
      }

      if (newStreak % 3 === 0) {
        try {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }
    } else {
      sounds.playError();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    sounds.playClick();
    setSelectedOption(null);
    setIsSubmitted(false);
    setCurrentQIdx(prev => prev + 1);
  };

  const handlePlayAudio = () => {
    if (!currentQuestion.audioSpeak) return;
    sounds.playClick();
    setIsSpeaking(true);
    speakVietnamese(currentQuestion.audioSpeak, () => setIsSpeaking(false));
  };

  // Magic pairs card click handler
  const handleCardClick = (card: CardPair) => {
    if (matchedPairs.includes(card.pairId)) return;
    if (selectedCard1 && selectedCard1.id === card.id) return;
    if (selectedCard1 && selectedCard2) return; // Wait during comparison

    sounds.playClick();

    if (!selectedCard1) {
      setSelectedCard1(card);
    } else {
      setSelectedCard2(card);
      // Check match
      if (selectedCard1.pairId === card.pairId) {
        sounds.playSuccess();
        setMatchedPairs(prev => {
          const updated = [...prev, card.pairId];
          const roundData = ALL_PAIR_ROUNDS[pairRound];
          if (updated.length === roundData.pairs.length) {
            sounds.playFanfare();
            try {
              confetti({ particleCount: 70, spread: 80 });
            } catch {}
          }
          return updated;
        });
        setScore(prev => prev + 150);
        if (onEarnStar) onEarnStar(1);

        setTimeout(() => {
          setSelectedCard1(null);
          setSelectedCard2(null);
        }, 500);
      } else {
        sounds.playError();
        setTimeout(() => {
          setSelectedCard1(null);
          setSelectedCard2(null);
        }, 800);
      }
    }
  };

  return (
    <div className={`transition-all ${isLandscape ? 'space-y-3' : 'space-y-6'}`}>
      {/* Game Header Bar */}
      <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all ${isLandscape ? 'p-3 sm:p-4' : 'p-6'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-amber-600 uppercase mb-0.5 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>Đấu Trường Thử Thách Vui Học</span>
            </div>
            <h2 className={`${isLandscape ? 'text-lg sm:text-xl' : 'text-2xl'} font-bold text-slate-900 tracking-tight`}>
              Chinh Phục Bí Kíp Số Thập Phân
            </h2>
            {!isLandscape && (
              <p className="text-sm text-slate-600 mt-1">
                Thử tài qua 4 mini-game tương tác hấp dẫn với hàng chục bài tập phân số và số thập phân chuẩn giáo trình!
              </p>
            )}
          </div>

          {/* Score & Streak Stats */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>{totalStars} Sao</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-indigo-500" />
              <span>{score} Điểm</span>
            </div>

            {streak > 1 && (
              <div className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-bounce">
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-400" />
                <span>x{streak}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mini Game Tabs */}
        <div className={`border-t border-slate-100 flex flex-wrap gap-1.5 sm:gap-2 ${isLandscape ? 'mt-2 pt-2' : 'mt-4 pt-4'}`}>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveMiniGame('place-hunter');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMiniGame === 'place-hunter'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🎯 Thợ Săn Hàng ({PLACE_HUNTER_QUESTIONS.length})
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveMiniGame('magic-pairs');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMiniGame === 'magic-pairs'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🧩 Ghép Đôi Phép Thuật (24 thẻ)
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveMiniGame('listen-shoot');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMiniGame === 'listen-shoot'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🎧 Nghe & Bắn Bia ({LISTEN_SHOOT_QUESTIONS.length})
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveMiniGame('real-world');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMiniGame === 'real-world'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🌍 Đo Lường Đời Sống ({REAL_WORLD_QUESTIONS.length})
          </button>

          {onNavigateToPlaceMatch && (
            <button
              onClick={() => {
                sounds.playClick();
                onNavigateToPlaceMatch();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs hover:opacity-95 transition-all inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ Game Ghép Hàng</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Game Interface */}
      {activeMiniGame === 'magic-pairs' ? (
        /* Game 2: Magic Pairs Card Matching with Standard Fraction Typography */
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all ${isLandscape ? 'p-3 sm:p-4 space-y-3' : 'p-6 space-y-5'}`}>
          {/* Round Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Thử Thách Nối Thẻ Thần Kỳ
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Bấm chọn 1 thẻ Phân số thập phân và 1 thẻ Số thập phân tương ứng để ghép cặp.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">Màn:</span>
              {[1, 2, 3, 4].map(r => (
                <button
                  key={r}
                  onClick={() => {
                    sounds.playClick();
                    setPairRound(r);
                    initMagicPairs(r);
                  }}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pairRound === r
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}

              <button
                onClick={() => {
                  sounds.playClick();
                  initMagicPairs(pairRound);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors ml-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Trộn lại</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] sm:text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 inline-block">
            {ALL_PAIR_ROUNDS[pairRound]?.title}
          </div>

          {/* Cards Grid - 4 to 6 columns in landscape */}
          <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-6 gap-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'}`}>
            {cards.map((card) => {
              const isMatched = matchedPairs.includes(card.pairId);
              const isSelected = selectedCard1?.id === card.id || selectedCard2?.id === card.id;

              return (
                <button
                  key={card.id}
                  disabled={isMatched}
                  onClick={() => handleCardClick(card)}
                  className={`rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isLandscape ? 'p-2 min-h-[64px] gap-0.5' : 'p-4 min-h-[105px] gap-1.5'
                  } ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-300 opacity-60 cursor-default scale-95'
                      : isSelected
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-102 ring-2 ring-amber-300'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
                  }`}
                >
                  {card.type === 'fraction' && card.fractionNum && card.fractionDen ? (
                    <Fraction
                      num={card.fractionNum}
                      den={card.fractionDen}
                      whole={card.fractionWhole}
                      size={isLandscape ? "sm" : "lg"}
                      className={isSelected ? 'text-white' : isMatched ? 'text-emerald-700' : 'text-slate-900'}
                    />
                  ) : (
                    <span
                      className={`font-mono font-extrabold ${isLandscape ? 'text-lg sm:text-xl' : 'text-2xl'} ${
                        isSelected ? 'text-white' : isMatched ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {card.decimalText}
                    </span>
                  )}

                  {card.subText && (
                    <span
                      className={`text-[9px] sm:text-[10px] font-medium leading-tight ${
                        isSelected ? 'text-amber-100' : isMatched ? 'text-emerald-600' : 'text-slate-500'
                      }`}
                    >
                      {card.subText}
                    </span>
                  )}
                  {isMatched && (
                    <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {matchedPairs.length === ALL_PAIR_ROUNDS[pairRound].pairs.length && (
            <div className="p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-emerald-900 text-sm sm:text-base">
                🎉 Xuất sắc! Bạn đã hoàn thành trọn vẹn {ALL_PAIR_ROUNDS[pairRound].title}!
              </div>
              <p className="text-xs text-emerald-700">
                Hiểu rõ phân số thập phân giúp nhận biết số thập phân cực kỳ nhanh chóng.
              </p>
              {pairRound < 4 && (
                <button
                  onClick={() => {
                    const nextR = pairRound + 1;
                    setPairRound(nextR);
                    initMagicPairs(nextR);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Chuyển sang Màn {pairRound + 1}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Quiz Mini-games (Place Hunter / Listen & Shoot / Real World) - 2-column in landscape */
        <div className={`grid ${isLandscape ? 'grid-cols-2 gap-3' : 'grid-cols-1 lg:grid-cols-12 gap-6'} items-start`}>
          <div className={`${isLandscape ? 'p-3 space-y-3' : 'lg:col-span-8 p-6 space-y-6'} bg-white rounded-2xl border border-slate-200/80 shadow-xs`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider">
                Câu {((currentQIdx) % currentQuestions.length) + 1} / {currentQuestions.length}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Chủ đề: {currentQuestion.title}
              </span>
            </div>

            {/* Prompt Box */}
            <div className={`${isLandscape ? 'p-3 space-y-1.5' : 'p-5 space-y-3'} bg-amber-50/40 border border-amber-200/60 rounded-2xl`}>
              <h3 className={`${isLandscape ? 'text-xs sm:text-sm font-semibold' : 'text-base sm:text-lg font-bold'} text-slate-900 leading-snug`}>
                {currentQuestion.prompt}
              </h3>

              {currentQuestion.contextNum && (
                <div className={`${isLandscape ? 'text-2xl py-1' : 'text-3xl sm:text-4xl py-2'} font-extrabold font-mono text-center text-indigo-900 bg-white rounded-xl border border-amber-200/70 shadow-xs`}>
                  {currentQuestion.contextNum}
                </div>
              )}

              {currentQuestion.audioSpeak && (
                <div className="flex justify-center pt-0.5">
                  <button
                    onClick={handlePlayAudio}
                    disabled={isSpeaking}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${isLandscape ? 'text-[11px]' : 'text-xs'} font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? 'Đang đọc...' : 'Bấm để nghe đọc số'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Options with Standard Fraction Rendering (No "/") */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isLandscape ? 'gap-2' : 'gap-3'}`}>
              {currentQuestion.options.map((option, idx) => {
                const isChosen = selectedOption === option.rawVal;
                const isCorrect = option.rawVal === currentQuestion.correctAnswer;

                let optClass = 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs cursor-pointer';
                if (isSubmitted) {
                  if (isCorrect) {
                    optClass = 'bg-emerald-500 text-white border-emerald-500 ring-2 ring-emerald-300 font-bold';
                  } else if (isChosen && !isCorrect) {
                    optClass = 'bg-rose-500 text-white border-rose-500 font-bold';
                  } else {
                    optClass = 'bg-slate-50 text-slate-400 border-slate-200 opacity-60';
                  }
                } else if (isChosen) {
                  optClass = 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-300 font-semibold cursor-pointer';
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(option.rawVal)}
                    className={`${isLandscape ? 'p-2 min-h-[40px] text-xs' : 'p-3.5 min-h-[50px] text-xs sm:text-sm'} rounded-xl border text-left transition-all flex items-center justify-between ${optClass}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs opacity-70">{String.fromCharCode(65 + idx)}.</span>
                      {option.isFraction && option.num && option.den ? (
                        <Fraction
                          num={option.num}
                          den={option.den}
                          whole={option.whole}
                          size="sm"
                          className={isSubmitted && (isCorrect || isChosen) ? 'text-white' : 'text-slate-900'}
                        />
                      ) : (
                        <span>{option.label || option.rawVal}</span>
                      )}
                    </div>
                    {isSubmitted && isCorrect && <CheckCircle className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                    {isSubmitted && isChosen && !isCorrect && <XCircle className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Submit / Next Actions */}
            <div className="flex items-center justify-between pt-1">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption}
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Xác Nhận Đáp Án
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Explanation card after submit */}
            {isSubmitted && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  selectedOption === currentQuestion.correctAnswer
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="font-bold mb-0.5">
                  {selectedOption === currentQuestion.correctAnswer
                    ? '🎉 Hoàn toàn chính xác!'
                    : '❌ Rất tiếc, chưa đúng rồi!'}
                </div>
                <div>{currentQuestion.explanation}</div>
              </div>
            )}
          </div>

          {/* Right Trophy and Rules Box */}
          <div className={`${isLandscape ? 'space-y-3' : 'lg:col-span-4 space-y-4'}`}>
            <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs ${isLandscape ? 'p-3 space-y-2' : 'p-6 space-y-3'}`}>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Bí Kíp Đạt Điểm Cao</span>
              </h4>
              <ul className="text-[11px] sm:text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>
                  Quan sát kỹ dấu phẩy: Bên trái là <strong>phần nguyên</strong>, bên phải là <strong>phần thập phân</strong>.
                </li>
                <li>
                  Thứ tự các hàng phần thập phân: <strong>Phần mười (0,1)</strong> ➔ <strong>Phần trăm (0,01)</strong> ➔ <strong>Phần nghìn (0,001)</strong>.
                </li>
                <li>
                  Phân số thập phân luôn có mẫu số là 10, 100, 1000,...
                </li>
                <li>
                  Khi làm đúng liên tiếp, bạn sẽ nhận được <strong>Combo x2, x3</strong> giúp nhân đôi điểm số!
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
