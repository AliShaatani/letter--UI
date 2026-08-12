import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';
import { X, Check, FileSignature, Award, Eraser, Sparkles, Building2 } from 'lucide-react';

export const SignatureModal = ({ isOpen, onClose, onInsert }) => {
  const [activeTab, setActiveTab] = useState('draw'); // 'draw' | 'stamps'
  const [stampColor, setStampColor] = useState('#1B4B8A');
  const [stampText, setStampText] = useState('معتمد رسمياً - مكتب المدير العام');

  const sigCanvasRef = useRef(null);

  if (!isOpen) return null;

  const presetStamps = [
    { title: 'معتمد رسمياً', subtitle: 'مكتب المدير العام', color: '#1B4B8A', border: 'double' },
    { title: 'تم الاطلاع والإحالة', subtitle: 'للإجراءات والتنفيذ', color: '#1E9E5A', border: 'solid' },
    { title: 'عاجل وهام جداً', subtitle: 'المتابعة والإفادة', color: '#DC2626', border: 'dashed' },
    { title: 'خاتم التصديق والتأشير', subtitle: 'الإدارة العامة للمراسلات', color: '#C8952A', border: 'double' }
  ];

  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
  };

  const handleInsertHandSignature = () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      alert('يرجى رسم التوقيع أولاً قبل الإدراج');
      return;
    }

    const dataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
    onInsert({
      type: 'signature',
      src: dataUrl,
      width: 180,
      height: 70
    });
    onClose();
  };

  const handleInsertStamp = (stamp) => {
    // Generate SVG stamp data URL
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="220" height="90" viewBox="0 0 220 90">
        <rect x="5" y="5" width="210" height="80" rx="12" fill="#FAF9F6" stroke="${stamp.color}" stroke-width="4" stroke-dasharray="${stamp.border === 'dashed' ? '6,4' : 'none'}"/>
        <rect x="10" y="10" width="200" height="70" rx="8" fill="none" stroke="${stamp.color}" stroke-width="1.5"/>
        <text x="110" y="42" font-family="Cairo, sans-serif" font-size="16" font-weight="bold" fill="${stamp.color}" text-anchor="middle">${stamp.title}</text>
        <text x="110" y="62" font-family="Cairo, sans-serif" font-size="11" fill="${stamp.color}" text-anchor="middle">${stamp.subtitle}</text>
      </svg>
    `;

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 220;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');

      onInsert({
        type: 'stamp',
        src: dataUrl,
        width: 200,
        height: 80
      });
      URL.revokeObjectURL(url);
      onClose();
    };
    img.src = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E6EC] w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8952A] flex items-center justify-center text-white font-bold shadow-md">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-cairo">إدراج التوقيع أو الختم الرسمي</h3>
              <p className="text-xs text-blue-100">اختر نوع التوقيع لإضافته مباشرة على وثيقة الـ PDF</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 bg-slate-50 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`flex-1 py-2 text-xs font-bold font-cairo rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'draw'
                ? 'bg-white text-[#1B4B8A] shadow-xs border border-gray-200'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span>رسم التوقيع اليدوي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stamps')}
            className={`flex-1 py-2 text-xs font-bold font-cairo rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'stamps'
                ? 'bg-white text-[#1B4B8A] shadow-xs border border-gray-200'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>الأختام الرسمية المعتمدة</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {activeTab === 'draw' ? (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-[#1B4B8A] font-cairo">
                وقع بيدك داخل الصندوق المخصص أدناه:
              </label>

              <div className="border-2 border-dashed border-[#1B4B8A]/40 rounded-2xl bg-slate-50 overflow-hidden relative shadow-inner">
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor="#1B4B8A"
                  canvasProps={{
                    width: 440,
                    height: 180,
                    className: 'signature-canvas w-full cursor-crosshair'
                  }}
                />
                <button
                  type="button"
                  onClick={handleClearSignature}
                  className="absolute bottom-2 left-2 p-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-rose-600 shadow-xs text-xs font-bold flex items-center gap-1"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  مسح
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleInsertHandSignature}
                  className="flex items-center gap-2 px-6 py-2 text-xs font-bold font-cairo text-white bg-[#1B4B8A] hover:bg-[#123a6b] rounded-xl shadow-md"
                >
                  <Check className="w-4 h-4" />
                  إدراج التوقيع في الـ PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-[#1B4B8A] font-cairo">
                انقر على الختم المطلوب لإدراجه فورياً على المستند:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                {presetStamps.map((stamp, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleInsertStamp(stamp)}
                    className="p-3 bg-white rounded-2xl border-2 hover:scale-[1.02] transition-all text-center space-y-1 shadow-xs hover:shadow-md"
                    style={{ borderColor: stamp.color }}
                  >
                    <div className="font-bold text-sm font-cairo" style={{ color: stamp.color }}>
                      {stamp.title}
                    </div>
                    <div className="text-[11px] font-semibold text-gray-500">{stamp.subtitle}</div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
