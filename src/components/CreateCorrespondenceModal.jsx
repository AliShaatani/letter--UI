import React, { useState } from 'react';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';
import { DEPARTMENTS } from '../services/correspondenceService';
import { pdfBlobStore } from '../services/pdfBlobStore';
import { pdfMemoryStore } from '../services/pdfMemoryStore';
import {
  X,
  UploadCloud,
  FileText,
  Building2,
  CheckCircle2,
  RotateCcw,
  Send,
  Sparkles,
  FileCheck
} from 'lucide-react';

export const CreateCorrespondenceModal = () => {
  const {
    isCreateModalOpen,
    closeCreateModal,
    addCorrespondenceToQueue,
    setActiveView
  } = useCorrespondenceStore();

  const [formData, setFormData] = useState({
    refNumber: `IEC-2026-00${Math.floor(Math.random() * 89 + 10)}`,
    subject: '',
    sender: '',
    senderRepresentative: '',
    type: 'internal', // internal | external
    priority: 'urgent', // urgent | important | normal
    targetDepartment: DEPARTMENTS[0].name,
    summary: '',
    dateGregorian: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
    dateHijri: '30 صفر 1448 هـ'
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateModalOpen) return null;

  // Generate random reference number
  const handleGenerateRef = () => {
    const randomNum = Math.floor(Math.random() * 899 + 100);
    setFormData((prev) => ({
      ...prev,
      refNumber: `IEC-2026-${randomNum}`
    }));
  };

  // Handle PDF File Selection
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

    if (!formData.subject.trim()) {
      alert('يرجى كتابة موضوع المراسلة');
      return;
    }

    if (!formData.sender.trim()) {
      alert('يرجى تحديد الجهة أو الإدارة المراسلة');
      return;
    }

    setIsSubmitting(true);

    // Save File object into pdfMemoryStore and IndexedDB for instant zero-fail rendering
    if (pdfFile) {
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        pdfMemoryStore.setFile(formData.refNumber, arrayBuffer);
        await pdfBlobStore.savePdf(formData.refNumber, arrayBuffer);
      } catch (err) {
        console.error('Error caching PDF file:', err);
      }
    }

    // Create session blob URL from File object (Instant local rendering)
    const blobUrl = pdfFile ? URL.createObjectURL(pdfFile) : null;

    const newCorrespondence = {
      id: formData.refNumber,
      refNumber: formData.refNumber,
      subject: formData.subject,
      sender: formData.sender,
      senderRepresentative: formData.senderRepresentative || 'ممثّل الجهة المراسلة',
      dateGregorian: formData.dateGregorian,
      dateHijri: formData.dateHijri,
      type: formData.type,
      priority: formData.priority,
      status: 'pending',
      targetDepartment: formData.targetDepartment,
      summary: formData.summary || formData.subject,
      pageCount: 1,
      annotations: {},
      routeHistory: [],
      completedAt: null,
      hasFile: !!pdfFile,
      pdfBlobUrl: blobUrl,
      pdfFileName: pdfFile ? pdfFile.name : null
    };

    await addCorrespondenceToQueue(newCorrespondence);
    setIsSubmitting(false);
    closeCreateModal();
    setActiveView('main');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E6EC] w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8952A] flex items-center justify-center text-white font-bold shadow-md">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-cairo">
                رفع وإضافة مراسلة جديدة
              </h3>
              <p className="text-xs text-blue-100">
                أدخل بيانات المعاملة وارفق مستند الـ PDF الخاص بها
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCreateModal}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Section 1: PDF File Upload Box */}
          <div>
            <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1.5">
              مستند الـ PDF المرفق (اختياري عند الإنشاء)
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
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
                id="createPdfModalInput"
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
                      <p className="text-xs font-bold text-gray-800 truncate max-w-[220px]">
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
                <label htmlFor="createPdfModalInput" className="cursor-pointer block space-y-1.5">
                  <UploadCloud className="w-8 h-8 text-[#1B4B8A] mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-[#1B4B8A]">
                      اسحب ملف الـ PDF هنا أو انقر لاختيار ملف من جهازك
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      يدعم ملفات PDF فقط (الحجم الأقصى 30 ميجابايت)
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Section 2: Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reference Number */}
            <div>
              <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1">
                الرقم الإشاري *
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  required
                  value={formData.refNumber}
                  onChange={(e) => setFormData({ ...formData, refNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-gray-300 focus:border-[#1B4B8A] outline-none bg-slate-50 text-[#1B4B8A]"
                />
                <button
                  type="button"
                  onClick={handleGenerateRef}
                  className="px-2.5 py-2 text-[10px] font-bold text-[#C8952A] bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 shrink-0 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  توليد
                </button>
              </div>
            </div>

            {/* Target Department */}
            <div>
              <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1">
                الإدارة المُحالة إليها *
              </label>
              <select
                value={formData.targetDepartment}
                onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#1B4B8A] outline-none bg-white font-medium"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1">
                موضوع المراسلة / الخطاب *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="اكتب عنوان أو موضوع المراسلة..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#1B4B8A] outline-none"
              />
            </div>

            {/* Sender Entity */}
            <div>
              <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1">
                اسم الجهة / الإدارة المراسلة *
              </label>
              <input
                type="text"
                required
                value={formData.sender}
                onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                placeholder="اسم الجهة أو الإدارة المرسلة"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#1B4B8A] outline-none"
              />
            </div>

            {/* Sender Representative */}
            <div>
              <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1">
                الممثل المسؤول
              </label>
              <input
                type="text"
                value={formData.senderRepresentative}
                onChange={(e) => setFormData({ ...formData, senderRepresentative: e.target.value })}
                placeholder="اسم الممثل المسؤول أو الصفة"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#1B4B8A] outline-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1">
                نوع المراسلة
              </label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="modalType"
                    value="internal"
                    checked={formData.type === 'internal'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="accent-[#1B4B8A]"
                  />
                  مراسلة داخلية
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="modalType"
                    value="external"
                    checked={formData.type === 'external'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="accent-[#1B4B8A]"
                  />
                  مراسلة خارجية
                </label>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1">
                درجة الاستعجال
              </label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="modalPriority"
                    value="urgent"
                    checked={formData.priority === 'urgent'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="accent-red-600"
                  />
                  <span className="text-red-700 font-bold">عاجل 🔴</span>
                </label>
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="modalPriority"
                    value="important"
                    checked={formData.priority === 'important'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="accent-amber-600"
                  />
                  <span className="text-amber-800 font-bold">مهم 🟡</span>
                </label>
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="modalPriority"
                    value="normal"
                    checked={formData.priority === 'normal'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="accent-gray-600"
                  />
                  <span className="text-gray-700 font-medium">عادي ⚪</span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeCreateModal}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold font-cairo text-white bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] hover:from-[#123a6b] hover:to-[#0f2e55] rounded-xl shadow-lg disabled:opacity-50 transition-all border border-[#C8952A]/40"
            >
              {isSubmitting ? (
                <span>جاري الإضافة...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#E0B863]" />
                  <span>حفظ وإضافة إلى طابور المعاملات</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
