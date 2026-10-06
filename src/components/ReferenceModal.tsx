import React from 'react';
import { X, BookOpen, Check, Lightbulb } from 'lucide-react';
import { sounds } from '../utils/audio';
import { Fraction } from './Fraction';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 p-4 sm:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-900">
                Sổ Tay Bí Kíp: Số Thập Phân (Toán Lớp 5)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Tóm tắt lý thuyết cốt lõi, bảng các hàng & quy tắc đọc viết chuẩn GDPT
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-sm text-slate-700">
          {/* Section 1: Khái niệm & Cấu tạo */}
          <div className="space-y-2.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Khái Niệm & Cấu Tạo Số Thập Phân</span>
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Các phân số có mẫu số là 10, 100, 1000,... được gọi là <strong>phân số thập phân</strong>. 
              Các phân số này có thể viết thành <strong>số thập phân</strong>:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-semibold">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <Fraction num={1} den={10} size="sm" className="text-indigo-700" />
                  <span>=</span>
                  <span className="text-indigo-600 font-bold text-sm">0,1</span>
                </div>
                <span className="text-[11px] text-slate-500 font-sans">(Không phẩy một)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <Fraction num={1} den={100} size="sm" className="text-indigo-700" />
                  <span>=</span>
                  <span className="text-indigo-600 font-bold text-sm">0,01</span>
                </div>
                <span className="text-[11px] text-slate-500 font-sans">(Không phẩy không một)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <Fraction num={1} den={1000} size="sm" className="text-indigo-700" />
                  <span>=</span>
                  <span className="text-indigo-600 font-bold text-sm">0,001</span>
                </div>
                <span className="text-[11px] text-slate-500 font-sans">(Không phẩy không không một)</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-1">
              <div className="font-bold text-indigo-950">Mỗi số thập phân gồm 2 phần:</div>
              <ul className="list-disc pl-5 space-y-0.5 text-indigo-900">
                <li><strong>Phần nguyên:</strong> Những chữ số ở <em>bên trái</em> dấu phẩy.</li>
                <li><strong>Phần thập phân:</strong> Những chữ số ở <em>bên phải</em> dấu phẩy.</li>
                <li>Hai phần được ngăn cách bởi <strong>dấu phẩy (,)</strong>.</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Bảng các hàng */}
          <div className="space-y-2.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Bảng Các Hàng Của Số Thập Phân</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th colSpan={3} className="border border-slate-200 p-2 bg-emerald-50 text-emerald-800">
                      PHẦN NGUYÊN
                    </th>
                    <th className="border border-slate-200 p-2 bg-rose-50 text-rose-700">DẤU</th>
                    <th colSpan={3} className="border border-slate-200 p-2 bg-indigo-50 text-indigo-800">
                      PHẦN THẬP PHÂN
                    </th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="border border-slate-200 p-1.5 font-medium">Hàng trăm</th>
                    <th className="border border-slate-200 p-1.5 font-medium">Hàng chục</th>
                    <th className="border border-slate-200 p-1.5 font-medium">Hàng đơn vị</th>
                    <th className="border border-slate-200 p-1.5 font-bold text-rose-600">Phẩy</th>
                    <th className="border border-slate-200 p-1.5 font-medium">Hàng phần mười</th>
                    <th className="border border-slate-200 p-1.5 font-medium">Hàng phần trăm</th>
                    <th className="border border-slate-200 p-1.5 font-medium">Hàng phần nghìn</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-slate-900 font-bold">
                  <tr>
                    <td className="border border-slate-200 p-2 text-emerald-700">3</td>
                    <td className="border border-slate-200 p-2 text-emerald-700">7</td>
                    <td className="border border-slate-200 p-2 text-emerald-700">5</td>
                    <td className="border border-slate-200 p-2 text-rose-600 text-base">,</td>
                    <td className="border border-slate-200 p-2 text-indigo-700">4</td>
                    <td className="border border-slate-200 p-2 text-indigo-700">8</td>
                    <td className="border border-slate-200 p-2 text-indigo-700">2</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed flex flex-wrap items-center gap-1">
              <span>⭐ <strong>Mối quan hệ:</strong> Trong số thập phân, mỗi đơn vị của một hàng gấp <strong>10 lần</strong> đơn vị của hàng thấp hơn liền sau nó, hoặc bằng</span>
              <Fraction num={1} den={10} size="xs" className="text-indigo-700" />
              <span>(0,1) đơn vị của hàng cao hơn liền trước nó.</span>
            </div>
          </div>

          {/* Section 3: Đọc và viết */}
          <div className="space-y-2.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Quy Tắc Đọc & Viết Số Thập Phân</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-900 block text-sm">Cách đọc:</span>
                <p className="text-slate-600">
                  Đọc lần lượt từ hàng cao đến hàng thấp: trước hết đọc phần nguyên, đọc dấu phẩy là &ldquo;phẩy&rdquo;, sau đó đọc phần thập phân.
                </p>
                <div className="text-indigo-800 font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                  <strong>Ví dụ:</strong> 45,8 đọc là &ldquo;Bốn mươi lăm phẩy tám&rdquo;.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-900 block text-sm">Cách viết:</span>
                <p className="text-slate-600">
                  Viết lần lượt từ hàng cao đến hàng thấp: trước hết viết phần nguyên, viết dấu phẩy, sau đó viết phần thập phân.
                </p>
                <div className="text-indigo-800 font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                  <strong>Ví dụ:</strong> &ldquo;Chín phẩy không năm&rdquo; viết là <strong>9,05</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Tính chất số thập phân bằng nhau */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Tính chất số thập phân bằng nhau:</span>
              <p className="leading-relaxed">
                Nếu viết thêm chữ số 0 vào bên phải phần thập phân của một số thập phân thì được một số thập phân bằng nó.
                <br />
                <span className="font-mono font-bold">0,9 = 0,90 = 0,900 = 0,9000</span>
                <br />
                Nếu một số thập phân có chữ số 0 ở tận cùng bên phải phần thập phân thì khi bỏ chữ số 0 đó đi, ta cũng được một số thập phân bằng nó.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            Đã hiểu, quay lại trò chơi
          </button>
        </div>
      </div>
    </div>
  );
};
