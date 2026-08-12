import React, { useEffect, useState } from 'react';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';
import { DEPARTMENTS } from '../services/correspondenceService';
import { DocumentRenderer } from './DocumentRenderer';
import {
  Archive,
  Search,
  Building2,
  Calendar,
  Eye,
  X,
  FileCheck,
  User,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ArchiveView = () => {
  const {
    archiveQueue,
    loadArchive,
    archiveFilters,
    setArchiveFilter,
    setActiveView,
    selectedArchiveDoc,
    setSelectedArchiveDoc
  } = useCorrespondenceStore();

  useEffect(() => {
    loadArchive();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA] p-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-4 mb-6 bg-white p-5 rounded-3xl border border-[#E2E6EC] shadow-xs flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B4B8A] to-[#123a6b] text-white flex items-center justify-center shadow-md border border-[#C8952A]/40">
            <Archive className="w-6 h-6 text-[#E0B863]" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-cairo text-[#1B4B8A]">
              الأرشيف الإلكتروني للمراسلات المكتملة
            </h2>
            <p className="text-xs text-[#6B7280]">
              استعراض كافة المراسلات والمكاتبات المعالجة والمُحالة للإدارات
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('main')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold font-cairo text-[#1B4B8A] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمعاملات الجارية</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E6EC] mb-6 shadow-xs flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={archiveFilters.search}
            onChange={(e) => setArchiveFilter('search', e.target.value)}
            placeholder="بحث برقم المراسلة، العنوان، أو الجهة..."
            className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#1B4B8A]"
          />
        </div>

        {/* Department Filter */}
        <div className="min-w-[200px]">
          <select
            value={archiveFilters.department}
            onChange={(e) => setArchiveFilter('department', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none bg-white font-medium"
          >
            <option value="all">جميع الإدارات المُحالة</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-gray-500 font-semibold me-auto">
          إجمالي المؤرشف: <span className="font-bold text-[#1B4B8A]">{archiveQueue.length}</span> مراسلة
        </span>
      </div>

      {/* Archive Cards Grid */}
      {archiveQueue.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <Archive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-base font-cairo text-gray-700">
            لا توجد مراسلات مؤرشفة مطابقة للبحث
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {archiveQueue.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedArchiveDoc(item)}
              className="bg-white rounded-2xl border border-[#E2E6EC] p-4 hover:shadow-lg hover:border-[#1B4B8A] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#1B4B8A] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {item.refNumber}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-[#1E9E5A] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    مؤرشف ومُحال
                  </span>
                </div>

                {/* Subject */}
                <h3 className="font-bold text-sm font-cairo text-[#1A1F2B] group-hover:text-[#1B4B8A] line-clamp-2 mb-2">
                  {item.subject}
                </h3>

                {/* Sender */}
                <p className="text-xs text-gray-500 mb-3 truncate">
                  من: <span className="font-semibold text-gray-700">{item.sender}</span>
                </p>

                {/* Routed Departments Badges */}
                {item.routedTo && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.routedTo.map((dept, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-amber-50 text-[#C8952A] px-2 py-0.5 rounded-md border border-amber-200"
                      >
                        ← {dept}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Info */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-[#1B4B8A]" />
                  <span>{item.annotatorName || 'المدير العام'}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[#1B4B8A] font-semibold group-hover:underline">
                  <Eye className="w-3.5 h-3.5" />
                  <span>عرض التفاصيل والتوقيع</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Archived Doc Read-Only Preview Modal */}
      {selectedArchiveDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2E6EC] w-full max-w-6xl h-[92vh] overflow-hidden flex flex-col">
            {/* Modal Top Header */}
            <div className="bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C8952A] flex items-center justify-center text-white font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-cairo">
                    معاينة المراسلة المؤرشفة: {selectedArchiveDoc.refNumber}
                  </h3>
                  <p className="text-xs text-blue-100 truncate max-w-xl">
                    {selectedArchiveDoc.subject}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedArchiveDoc(null)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split view (Read-only document + Audit summary panel) */}
            <div className="flex-1 flex overflow-hidden">
              {/* Document Renderer in ReadOnly mode */}
              <div className="flex-1 overflow-hidden">
                <DocumentRenderer item={selectedArchiveDoc} readOnly={true} />
              </div>

              {/* Sidebar Audit Info */}
              <div className="w-80 bg-[#F7F8FA] border-r border-gray-200 p-5 overflow-y-auto hidden lg:block text-xs space-y-5">
                <div>
                  <h4 className="font-bold font-cairo text-[#1B4B8A] text-sm mb-2">
                    سجل التوجيه والإحالة
                  </h4>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                    <div>
                      <span className="text-gray-400 block">قام بالتهميش:</span>
                      <span className="font-bold text-[#1A1F2B]">
                        {selectedArchiveDoc.annotatorName || 'سعادة المدير العام'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">تاريخ الإحالة:</span>
                      <span className="font-medium text-gray-700">
                        {selectedArchiveDoc.completedAt
                          ? new Date(selectedArchiveDoc.completedAt).toLocaleString('ar-EG')
                          : selectedArchiveDoc.dateGregorian}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hand Signature attached */}
                {selectedArchiveDoc.signature && (
                  <div>
                    <h4 className="font-bold font-cairo text-[#1B4B8A] text-sm mb-2">
                      التوقيع المرفق
                    </h4>
                    <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
                      <img
                        src={selectedArchiveDoc.signature}
                        alt="التوقيع المعتمد"
                        className="max-h-20 mx-auto object-contain"
                      />
                      <span className="text-[10px] text-gray-400 block mt-1">
                        توقيع الكتروني موثق
                      </span>
                    </div>
                  </div>
                )}

                {/* Routed Departments */}
                {selectedArchiveDoc.routedTo && (
                  <div>
                    <h4 className="font-bold font-cairo text-[#1B4B8A] text-sm mb-2">
                      الإدارات المُحالة إليها
                    </h4>
                    <div className="space-y-1.5">
                      {selectedArchiveDoc.routedTo.map((dept, i) => (
                        <div
                          key={i}
                          className="bg-amber-50 text-[#C8952A] font-bold p-2 rounded-xl border border-amber-200 flex items-center gap-2"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>{dept}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Directive Note */}
                {selectedArchiveDoc.note && (
                  <div>
                    <h4 className="font-bold font-cairo text-[#1B4B8A] text-sm mb-2">
                      التوجيه / الملاحظة الإدارية
                    </h4>
                    <div className="bg-white p-3 rounded-xl border border-gray-200 text-gray-700 leading-relaxed italic">
                      "{selectedArchiveDoc.note}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
