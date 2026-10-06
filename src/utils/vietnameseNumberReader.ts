/**
 * Vietnamese Decimal Number to Text Converter & Speech Synthesizer
 * Formatted accurately according to Vietnamese Grade 5 Mathematics curriculum
 */

const DIGIT_WORDS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

/**
 * Read integer up to 999
 */
export function readThreeDigits(n: number, full: boolean = false): string {
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  const tens = Math.floor(remainder / 10);
  const units = remainder % 10;

  const parts: string[] = [];

  if (hundreds > 0 || full) {
    parts.push(`${DIGIT_WORDS[hundreds]} trăm`);
  }

  if (tens > 1) {
    parts.push(`${DIGIT_WORDS[tens]} mươi`);
    if (units === 1) parts.push('mốt');
    else if (units === 4) parts.push('tư');
    else if (units === 5) parts.push('lăm');
    else if (units > 0) parts.push(DIGIT_WORDS[units]);
  } else if (tens === 1) {
    parts.push('mười');
    if (units === 5) parts.push('lăm');
    else if (units > 0) parts.push(DIGIT_WORDS[units]);
  } else {
    // tens === 0
    if (units > 0) {
      if (hundreds > 0 || full) {
        parts.push(`linh ${DIGIT_WORDS[units]}`);
      } else {
        parts.push(DIGIT_WORDS[units]);
      }
    } else if (hundreds === 0 && !full) {
      parts.push('không');
    }
  }

  return parts.join(' ');
}

/**
 * Read whole part (up to 999999)
 */
export function readIntegerPart(val: number): string {
  if (val === 0) return 'không';
  if (val < 1000) return readThreeDigits(val, false);

  const thousands = Math.floor(val / 1000);
  const rest = val % 1000;

  const thStr = `${readIntegerPart(thousands)} nghìn`;
  if (rest === 0) return thStr;
  return `${thStr} ${readThreeDigits(rest, true)}`;
}

/**
 * Read decimal fraction part (string of digits after comma)
 * Example:
 * "5" -> "năm"
 * "25" -> "hai mươi lăm"
 * "05" -> "không năm" (hoặc "không mươi lăm")
 * "007" -> "không không bảy"
 * "125" -> "một trăm hai mươi lăm"
 */
export function readDecimalDigits(decStr: string): string {
  if (!decStr || decStr.length === 0) return '';

  // Leading zeros like "05" or "007"
  const leadingZeros = decStr.match(/^0+/);
  if (leadingZeros) {
    const zeroCount = leadingZeros[0].length;
    const remaining = decStr.substring(zeroCount);
    const zeroWords = Array(zeroCount).fill('không').join(' ');
    if (remaining.length === 0) {
      return zeroWords;
    }
    const remNum = parseInt(remaining, 10);
    return `${zeroWords} ${readThreeDigits(remNum, false)}`;
  }

  const num = parseInt(decStr, 10);
  if (decStr.length <= 3) {
    return readThreeDigits(num, false);
  }
  return readIntegerPart(num);
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate full reading according to Vietnamese textbook:
 * Example: 34,75 -> "Ba mươi tư phẩy bảy mươi lăm"
 *          0,5   -> "Không phẩy năm"
 *          8,06  -> "Tám phẩy không sáu"
 */
export function readDecimalNumber(whole: number, decimalDigits: string): string {
  const wholeWords = readIntegerPart(whole);
  if (!decimalDigits || decimalDigits.length === 0) {
    return capitalizeFirst(wholeWords);
  }
  const decWords = readDecimalDigits(decimalDigits);
  return capitalizeFirst(`${wholeWords} phẩy ${decWords}`);
}

/**
 * Provide place-value pedagogical breakdown:
 * Example: 45,86 -> "4 chục, 5 đơn vị, 8 phần mười, 6 phần trăm"
 */
export function readPlaceValueBreakdown(wholeStr: string, decStr: string): string[] {
  const items: string[] = [];
  const w = wholeStr.padStart(3, '0');
  const d = decStr.padEnd(3, '0');

  const hundreds = parseInt(w[w.length - 3] || '0', 10);
  const tens = parseInt(w[w.length - 2] || '0', 10);
  const ones = parseInt(w[w.length - 1] || '0', 10);

  const tenths = parseInt(d[0] || '0', 10);
  const hundredths = parseInt(d[1] || '0', 10);
  const thousandths = parseInt(d[2] || '0', 10);

  if (hundreds > 0) items.push(`${hundreds} trăm`);
  if (tens > 0) items.push(`${tens} chục`);
  if (ones > 0 || (hundreds === 0 && tens === 0 && tenths === 0 && hundredths === 0 && thousandths === 0)) {
    items.push(`${ones} đơn vị`);
  }
  if (tenths > 0) items.push(`${tenths} phần mười`);
  if (hundredths > 0) items.push(`${hundredths} phần trăm`);
  if (thousandths > 0) items.push(`${thousandths} phần nghìn`);

  return items;
}

/**
 * Web Speech API Voice Reader for Vietnamese
 */
export function speakVietnamese(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9; // Slightly slower for primary school children clarity
    utterance.pitch = 1.05;

    // Try finding a Vietnamese voice if available
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    if (onEnd) onEnd();
  }
}
