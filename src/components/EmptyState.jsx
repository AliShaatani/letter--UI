import React from 'react';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';
import { ShieldCheck, Archive, Upload } from 'lucide-react';

export const EmptyState = () => {
  const { setActiveView, uploadPdf, showToast } = useCorrespondenceStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-islamic-pattern min-h-[calc(100vh-65px)]">
      <div className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#E2E6EC] shadow-lg animate-fade-in relative overflow-hidden">
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#1B4B8A] via-[#C8952A] to-[#123a6b]" />

        {/* Dignified Executive Emblem */}
        <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-[#E2E6EC] flex items-center justify-center mx-auto mb-6 shadow-xs relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1B4B8A] to-[#123a6b] text-white flex items-center justify-center shadow-md border border-[#C8952A]/40">
            <ShieldCheck className="w-8 h-8 text-[#E0B863]" />
          </div>
        </div>

        <h2 className="text-xl font-bold font-cairo text-[#1B4B8A] mb-3">
          تم إنجاز وتوجيه كافة المعاملات الإدارية
        </h2>

        <p className="text-xs text-[#6B7280] leading-relaxed mb-8 max-w-md mx-auto">
          جميع المعاملات والمراسلات في طابور العمل المباشر تم مراجعتها، وضع التهميشات والتوقيعات اللازمة عليها، وإحالتها إلكترونياً إلى الإدارات المختصة.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 max-w-sm mx-auto">
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            id="empty-upload-input"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.type !== 'application/pdf') {
                showToast('يرجى اختيار ملف PDF صالح ⚠️', 'error');
                return;
              }
              try {
                showToast('جاري تحميل وتحليل ملف PDF... ⏳', 'info');
                await uploadPdf(file);
                showToast('تم رفع الملف بنجاح 🎉', 'success');
              } catch (err) {
                console.error(err);
                showToast('حدث خطأ أثناء تحميل الملف ⚠️', 'error');
              }
            }}
          />
          <label
            htmlFor="empty-upload-input"
            className="w-full flex items-center justify-center gap-2 py-3 px-5 text-xs font-bold font-cairo rounded-xl bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] text-white shadow-sm hover:shadow-md transition-all border border-[#C8952A]/40 cursor-pointer text-center"
          >
            <Upload className="w-4 h-4 text-[#E0B863]" />
            <span>رفع ملف PDF لبدء التهميش</span>
          </label>

          <button
            onClick={() => setActiveView('archive')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
          >
            <Archive className="w-3.5 h-3.5 text-[#C8952A]" />
            <span>استعراض الأرشيف الإلكتروني (المعاملات المكتملة)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
