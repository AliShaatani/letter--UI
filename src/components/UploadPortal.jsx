import React, { useState } from 'react';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';
import { DEPARTMENTS } from '../services/correspondenceService';
import { pdfBlobStore } from '../services/pdfBlobStore';
import {
  UploadCloud,
  FileText,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Calendar,
  X,
  File,
  RotateCcw,
  ArrowRight,
  FolderOpen
} from 'lucide-react';

export const UploadPortal = () => {
  const { addCorrespondenceToQueue, setActiveView, showToast } = useCorrespondenceStore();

  const samplePdfList = [
    { name: 'طلب اعتماد ميزانية (sample1.pdf)', path: '/pdfs/sample1.pdf' },
    { name: 'دعوة مشاركة في ندوة (sample2.pdf)', path: '/pdfs/sample2.pdf' },
    { name: 'تقرير مراجعة داحلية (sample3.pdf)', path: '/pdfs/sample3.pdf' },
    { name: 'مذكرة تفاهم وتعاون (sample4.pdf)', path: '/pdfs/sample4.pdf' }
  ];

  const [formData, setFormData] = useState({
    refNumber: `IEC-2026-00${Math.floor(Math.random() * 90 + 10)}`,
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
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const [selectedSamplePdf, setSelectedSamplePdf] = useState('/pdfs/sample1.pdf');
  const [customPdfPath, setCustomPdfPath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Generate random reference number
  const handleGenerateRef = () => {
    const randomNum = Math.floor(Math.random() * 899 + 100);
    setFormData((prev) => ({
      ...prev,
      refNumber: `IEC-2026-${randomNum}`
    }));
  };

  // Handle PDF File Upload
  const handleFileChange = (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('يرجى اختيار ملف بصيغة PDF فقط');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('حجم الملف كبير جداً (الحجم الأقصى 25 ميجابايت)');
      return;
    }

    setPdfFile(file);
    setSelectedSamplePdf('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setPdfDataUrl(e.target.result);
    };
    reader.readAsDataURL(file);
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

    const pdfUrlToUse = customPdfPath.trim() || selectedSamplePdf || '/pdfs/sample1.pdf';

    // Save uploaded PDF blob to IndexedDB to avoid localStorage quota limits
    if (pdfDataUrl || pdfFile) {
      await pdfBlobStore.savePdf(formData.refNumber, pdfDataUrl || pdfFile);
    }

    // Create new correspondence item object
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
      pdfUrl: pdfUrlToUse
    };

    await addCorrespondenceToQueue(newCorrespondence);
    setIsSubmitting(false);

    // Navigate immediately to main document workspace view
    setActiveView('main');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA] p-6 max-w-5xl mx-auto w-full">
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-4 mb-6 bg-white p-6 rounded-3xl border border-[#E2E6EC] shadow-xs flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B4B8A] to-[#123a6b] text-white flex items-center justify-center shadow-md border border-[#C8952A]/40 shrink-0">
            <UploadCloud className="w-7 h-7 text-[#E0B863]" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-cairo text-[#1B4B8A]">
              رفع وإضافة مستند PDF جديد
            </h2>
            <p className="text-xs text-[#6B7280]">
              قم برفع ملف الـ PDF من جهازك أو اختيار المسار المباشر ليُعرض فوراً للتهميش والتوقيع
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('main')}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-cairo text-white bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] rounded-xl shadow-md transition-all hover:scale-105 border border-[#C8952A]/40"
        >
          <span>الذهاب لطابور التهميش الرئيسي</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E2E6EC] shadow-lg p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reference Number */}
          <div>
            <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1.5">
              رقم المراسلة الإشاري *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={formData.refNumber}
                onChange={(e) => setFormData({ ...formData, refNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-gray-300 focus:border-[#1B4B8A] outline-none bg-slate-50 text-[#1B4B8A]"
              />
              <button
                type="button"
                onClick={handleGenerateRef}
                className="px-3 py-2 text-[11px] font-bold text-[#C8952A] bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors shrink-0 flex items-center gap-1"
                title="توليد رقم تلقائي"
              >
                <RotateCcw className="w-3 h-3" />
                توليد
              </button>
            </div>
          </div>

          {/* Target Department */}
          <div>
            <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1.5">
              الإدارة المُحالة إليها (المستهدفة) *
            </label>
            <select
              value={formData.targetDepartment}
              onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#1B4B8A] outline-none bg-white font-medium"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Title */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1.5">
              موضوع المراسلة / الخطاب *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="مثال: طلب اعتماد الميزانية التشغيلية لعام 2026م..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:border-[#1B4B8A] outline-none"
            />
          </div>

          {/* Sender Entity */}
          <div>
            <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1.5">
              اسم الجهة / الإدارة المراسلة *
            </label>
            <input
              type="text"
              required
              value={formData.sender}
              onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
              placeholder="مثال: إدارة الشؤون الثقافية والأنشطة"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#1B4B8A] outline-none"
            />
          </div>

          {/* Sender Representative */}
          <div>
            <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1.5">
              اسم وتوقيع ممثل الجهة المراسلة
            </label>
            <input
              type="text"
              value={formData.senderRepresentative}
              onChange={(e) => setFormData({ ...formData, senderRepresentative: e.target.value })}
              placeholder="مثال: د. عبد الرحمن السعيد - مدير الإدارة"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#1B4B8A] outline-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1.5">
              نوع المراسلة
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="internal"
                  checked={formData.type === 'internal'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="accent-[#1B4B8A]"
                />
                مراسلة داخلية
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="external"
                  checked={formData.type === 'external'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="accent-[#1B4B8A]"
                />
                مراسلة خارجية (خطاب وارد)
              </label>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1.5">
              درجة الاستعجال
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="urgent"
                  checked={formData.priority === 'urgent'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="accent-red-600"
                />
                <span className="text-red-700 font-bold">عاجل 🔴</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="important"
                  checked={formData.priority === 'important'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="accent-amber-600"
                />
                <span className="text-amber-800 font-bold">مهم 🟡</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="priority"
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

        {/* Drag & Drop PDF File Upload Box */}
        <div>
          <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1.5">
            تحميل مستند الـ PDF الأصلي *
          </label>
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
              id="pdfUploadInput"
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
                  onClick={() => {
                    setPdfFile(null);
                    setPdfDataUrl(null);
                  }}
                  className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label htmlFor="pdfUploadInput" className="cursor-pointer block space-y-2">
                <UploadCloud className="w-10 h-10 text-[#1B4B8A] mx-auto animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-[#1B4B8A]">
                    اسحب ملف الـ PDF هنا أو انقر للتصفح من جهازك
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    يمكنك اختيار ملف PDF محلي أو الاختيار من مجلد public/pdfs
                  </p>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Alternative: Select from public/pdfs or Enter File Path */}
        {!pdfFile && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B4B8A]">
              <FolderOpen className="w-4 h-4 text-[#C8952A]" />
              <span>أو اختر مستنداً من مجلد المراسلات (public/pdfs/):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePdfList.map((sample) => (
                <button
                  type="button"
                  key={sample.path}
                  onClick={() => {
                    setSelectedSamplePdf(sample.path);
                    setCustomPdfPath('');
                  }}
                  className={`p-2.5 rounded-xl border text-xs text-right transition-all flex items-center justify-between ${
                    selectedSamplePdf === sample.path
                      ? 'bg-blue-50 border-[#1B4B8A] text-[#1B4B8A] font-bold shadow-xs'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate">{sample.name}</span>
                  <span className="text-[10px] font-mono text-gray-400">{sample.path}</span>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                أو اكتب مسار ملف الـ PDF المباشر:
              </label>
              <input
                type="text"
                value={customPdfPath}
                onChange={(e) => {
                  setCustomPdfPath(e.target.value);
                  setSelectedSamplePdf('');
                }}
                placeholder="مثال: /pdfs/doc_2026.pdf"
                className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-gray-300 outline-none focus:border-[#1B4B8A]"
              />
            </div>
          </div>
        )}

        {/* Summary text */}
        <div>
          <label className="block text-xs font-bold font-cairo text-[#1B4B8A] mb-1.5">
            ملخص الخطاب أو الملاحظات المرفقة (اختياري)
          </label>
          <textarea
            rows={2}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="اكتب ملخصاً موجزاً لمعروض المعاملة والمطلوب تهميشه..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#1B4B8A] outline-none leading-relaxed"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 text-xs font-bold font-cairo text-white bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] hover:from-[#123a6b] hover:to-[#0f2e55] rounded-xl shadow-lg disabled:opacity-50 transition-all border border-[#C8952A]/40"
          >
            {isSubmitting ? (
              <span>جاري رفع وإرسال المراسلة...</span>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#E0B863]" />
                <span>إرسال المراسلة وعرض الـ PDF للتهميش</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
