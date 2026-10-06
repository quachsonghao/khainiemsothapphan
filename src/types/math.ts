/**
 * Types and definitions for Decimal Math Interactive Learning
 */

export type MathMode = 'place-value' | 'place-match-game' | 'read-write' | 'game-arena';

export interface PlaceValueBreakdown {
  thousands: number; // Hàng nghìn (phần nguyên)
  hundreds: number;  // Hàng trăm (phần nguyên)
  tens: number;      // Hàng chục (phần nguyên)
  ones: number;      // Hàng đơn vị (phần nguyên)
  tenths: number;    // Hàng phần mười (phần thập phân)
  hundredths: number;// Hàng phần trăm (phần thập phân)
  thousandths: number;// Hàng phần nghìn (phần thập phân)
}

export type PlaceKey = 'hundreds' | 'tens' | 'ones' | 'tenths' | 'hundredths' | 'thousandths';

export interface PlaceInfo {
  key: PlaceKey;
  name: string;
  shortName: string;
  part: 'whole' | 'decimal';
  partName: 'Phần nguyên' | 'Phần thập phân';
  multiplier: number;
  fractionNumerator?: number;
  fractionDenominator?: number;
  fractionText: string;
  decimalText: string;
  color: string;
  accentBg: string;
  borderColor: string;
  description: string;
}

export const PLACE_CONFIG: Record<PlaceKey, PlaceInfo> = {
  hundreds: {
    key: 'hundreds',
    name: 'Hàng trăm',
    shortName: 'Trăm',
    part: 'whole',
    partName: 'Phần nguyên',
    multiplier: 100,
    fractionNumerator: 100,
    fractionDenominator: 1,
    fractionText: '100',
    decimalText: '100',
    color: 'text-amber-700',
    accentBg: 'bg-amber-500/10',
    borderColor: 'border-amber-300',
    description: 'Thuộc phần nguyên, mỗi đơn vị hàng trăm bằng 10 chục hay 100 đơn vị.'
  },
  tens: {
    key: 'tens',
    name: 'Hàng chục',
    shortName: 'Chục',
    part: 'whole',
    partName: 'Phần nguyên',
    multiplier: 10,
    fractionNumerator: 10,
    fractionDenominator: 1,
    fractionText: '10',
    decimalText: '10',
    color: 'text-blue-700',
    accentBg: 'bg-blue-500/10',
    borderColor: 'border-blue-300',
    description: 'Thuộc phần nguyên, mỗi đơn vị hàng chục bằng 10 đơn vị.'
  },
  ones: {
    key: 'ones',
    name: 'Hàng đơn vị',
    shortName: 'Đơn vị',
    part: 'whole',
    partName: 'Phần nguyên',
    multiplier: 1,
    fractionNumerator: 1,
    fractionDenominator: 1,
    fractionText: '1',
    decimalText: '1',
    color: 'text-emerald-700',
    accentBg: 'bg-emerald-500/10',
    borderColor: 'border-emerald-300',
    description: 'Thuộc phần nguyên, là hàng liền kề bên trái dấu phẩy.'
  },
  tenths: {
    key: 'tenths',
    name: 'Hàng phần mười',
    shortName: 'Phần mười',
    part: 'decimal',
    partName: 'Phần thập phân',
    multiplier: 0.1,
    fractionNumerator: 1,
    fractionDenominator: 10,
    fractionText: '1/10',
    decimalText: '0,1',
    color: 'text-indigo-700',
    accentBg: 'bg-indigo-500/10',
    borderColor: 'border-indigo-300',
    description: 'Thuộc phần thập phân, liền kề bên phải dấu phẩy. 1 đơn vị = 10 phần mười.'
  },
  hundredths: {
    key: 'hundredths',
    name: 'Hàng phần trăm',
    shortName: 'Phần trăm',
    part: 'decimal',
    partName: 'Phần thập phân',
    multiplier: 0.01,
    fractionNumerator: 1,
    fractionDenominator: 100,
    fractionText: '1/100',
    decimalText: '0,01',
    color: 'text-purple-700',
    accentBg: 'bg-purple-500/10',
    borderColor: 'border-purple-300',
    description: 'Thuộc phần thập phân, sau hàng phần mười. 1 phần mười = 10 phần trăm.'
  },
  thousandths: {
    key: 'thousandths',
    name: 'Hàng phần nghìn',
    shortName: 'Phần nghìn',
    part: 'decimal',
    partName: 'Phần thập phân',
    multiplier: 0.001,
    fractionNumerator: 1,
    fractionDenominator: 1000,
    fractionText: '1/1000',
    decimalText: '0,001',
    color: 'text-rose-700',
    accentBg: 'bg-rose-500/10',
    borderColor: 'border-rose-300',
    description: 'Thuộc phần thập phân, sau hàng phần trăm. 1 phần trăm = 10 phần nghìn.'
  }
};

export interface QuizQuestion {
  id: string;
  type: 'place-id' | 'value-of-digit' | 'read-match' | 'write-input' | 'fraction-convert' | 'practical';
  question: string;
  contextNumber?: string;
  targetDigit?: string;
  targetPlace?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
}
