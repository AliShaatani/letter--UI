import React, { useState } from 'react';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';
import { pdfMemoryStore } from '../services/pdfMemoryStore';
import { pdfBlobStore } from '../services/pdfBlobStore';
import { X, UploadCloud, FileText, CheckCircle2, FilePlus } from 'lucide-react';

export const AttachPdfModal = () => {
  const {
    isAttachModalOpen,
    closeAttachModal,
    attachTargetId,
    attachPdfToCorrespondence,
    pendingQueue
  } = useCorrespondenceStore();

  const [pdfFile, setPdfFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAttachModalOpen || !attachTargetId) return null;

  const targetItem = pendingQueue.find((item) => item.id === attachTargetId);

  const handleFileChange = (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('يرجى اختيار ملف بصيغة PDF فقط');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      alert('حجم الملف كبير جداً (الحجم الأقصى 30 ميجابايت)');
      return;
    }

    setPdfFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile) {
      alert('يرجى اختيار ملف الـ PDF أولاً');
      return;
    }

    setIsSubmitting(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      pdfMemoryStore.setFile(attachTargetId, arrayBuffer);
      await pdfBlobStore.savePdf(attachTargetId, arrayBuffer);
    } catch (err) {
      console.error('Error caching PDF file:', err);
    }

    await attachPdfToCorrespondence(attachTargetId, pdfFile);
    setIsSubmitting(false);
    setPdfFile(null);
    closeAttachModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E6EC] w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8952A] flex items-center justify-center text-white font-bold shadow-md">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-cairo">
                رفع وإرفاق ملف PDF للمراسلة
              </h3>
              <p className="text-xs text-blue-100 font-mono">
                المعاملة رقم: {targetItem?.refNumber || attachTargetId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAttachModal}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {targetItem?.subject && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-gray-400 block font-semibold">موضوع المراسلة:</span>
              <p className="font-bold text-[#1B4B8A] font-cairo mt-0.5">{targetItem.subject}</p>
            </div>
          )}

          {/* PDF Drag & Drop Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-[#C8952A] bg-amber-50/80 scale-[1.01]'
                : pdfFile
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-[#1B4B8A]/30 bg-slate-50/70 hover:border-[#1B4B8A] hover:bg-slate-100/70'
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              id="attachPdfModalInput"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              className="hidden"
            />

            {pdfFile ? (
              <div className="flex items-center justify-between max-w-md mx-auto bg-white p-3 rounded-xl border border-emerald-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#1E9E5A] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-800 truncate max-w-[200px]">
                      {pdfFile.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPdfFile(null)}
                  className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label htmlFor="attachPdfModalInput" className="cursor-pointer block space-y-2">
                <UploadCloud className="w-10 h-10 text-[#1B4B8A] mx-auto animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-[#1B4B8A]">
                    اسحب ملف الـ PDF هنا أو انقر لاختيار ملف من جهازك
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    اختر مستند الـ PDF الأصلي لربطه بهذه المعاملة وعرضه للتهميش
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeAttachModal}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !pdfFile}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold font-cairo text-white bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] hover:from-[#123a6b] hover:to-[#0f2e55] rounded-xl shadow-lg disabled:opacity-50 transition-all border border-[#C8952A]/40"
            >
              {isSubmitting ? (
                <span>جاري ربط الملف...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#E0B863]" />
                  <span>ربط الملف وعرض الـ PDF فوراً</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
