import React, { useState, useEffect } from 'react';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';
import { DEPARTMENTS, PRESET_NOTES } from '../services/correspondenceService';
import {
  X,
  Building2,
  FileText,
  CheckCircle2,
  Send,
  Check
} from 'lucide-react';

export const RoutingModal = () => {
  const {
    isRoutingModalOpen,
    closeRoutingModal,
    finalizeAndRouteCurrent,
    pendingQueue,
    currentId
  } = useCorrespondenceStore();

  const [selectedDepts, setSelectedDepts] = useState([]);
  const [note, setNote] = useState('');
  const [deptSearch, setDeptSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentItem = pendingQueue.find((item) => item.id === currentId);

  // Initialize target department when modal opens or current item changes
  useEffect(() => {
    if (isRoutingModalOpen && currentItem?.targetDepartment) {
      setSelectedDepts([currentItem.targetDepartment]);
      setNote('');
      setDeptSearch('');
      setIsSubmitting(false);
    }
  }, [isRoutingModalOpen, currentId]);

  if (!isRoutingModalOpen) return null;

  const handleDeptToggle = (deptName) => {
    if (selectedDepts.includes(deptName)) {
      setSelectedDepts(selectedDepts.filter((d) => d !== deptName));
    } else {
      setSelectedDepts([...selectedDepts, deptName]);
    }
  };

  const handlePresetNote = (presetText) => {
    setNote((prev) => (prev ? `${prev}\n${presetText}` : presetText));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedDepts.length === 0) {
      alert('يرجى اختيار إدارة واحدة على الأقل للإحالة إليها');
      return;
    }

    setIsSubmitting(true);

    try {
      await finalizeAndRouteCurrent({
        signature: null,
        referTo: selectedDepts,
        note
      });
    } catch (error) {
      console.error('Error submitting routing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepts = DEPARTMENTS.filter((d) =>
    d.name.toLowerCase().includes(deptSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E6EC] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8952A] flex items-center justify-center text-white font-bold shadow-md">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-cairo">
                إنهاء التهميش وإحالة المراسلة
              </h3>
              <p className="text-xs text-blue-100 font-mono">
                المعاملة رقم: {currentItem?.refNumber || 'IEC-2026'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeRoutingModal}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Department Selection (الإحالة إلى) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold font-cairo text-[#1B4B8A] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C8952A]" />
                <span>الإحالة إلى (اختر إحالة واحدة أو أكثر) *</span>
              </label>
              <span className="text-xs text-gray-500 font-semibold">
                تم تحديد {selectedDepts.length} إدارات
              </span>
            </div>

            {/* Department Search Input */}
            <input
              type="text"
              value={deptSearch}
              onChange={(e) => setDeptSearch(e.target.value)}
              placeholder="تصفية الإدارات..."
              className="w-full mb-3 px-3 py-1.5 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#1B4B8A]"
            />

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
              {filteredDepts.map((dept) => {
                const isChecked = selectedDepts.includes(dept.name);
                return (
                  <button
                    type="button"
                    key={dept.id}
                    onClick={() => handleDeptToggle(dept.name)}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      isChecked
                        ? 'bg-[#1B4B8A] text-white border-[#1B4B8A] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{dept.name}</span>
                    {isChecked ? (
                      <Check className="w-4 h-4 shrink-0 text-[#E0B863]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Optional Notes & Presets */}
          <div>
            <label className="block text-sm font-bold font-cairo text-[#1B4B8A] mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C8952A]" />
              <span>ملاحظة أو توجيه إداري إضافي (اختياري)</span>
            </label>

            {/* Preset Tags */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {PRESET_NOTES.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handlePresetNote(preset)}
                  className="text-[11px] bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 px-2.5 py-1 rounded-lg transition-colors border border-slate-200 line-clamp-1"
                  title={preset}
                >
                  + {preset.substring(0, 32)}...
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب التوجيه أو الملاحظات التفصيلية للإدارة المُحالة إليها..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#1B4B8A] focus:ring-1 focus:ring-[#1B4B8A] outline-none leading-relaxed"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeRoutingModal}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedDepts.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold font-cairo text-white bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] hover:from-[#123a6b] hover:to-[#0f2e55] rounded-xl shadow-lg disabled:opacity-50 transition-all border border-[#C8952A]/40"
            >
              {isSubmitting ? (
                <span>جاري الحفظ والإحالة...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#E0B863]" />
                  <span>حفظ وإحالة المراسلة تلقائياً</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
