import React, { useState } from 'react';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';
import {
  GripVertical,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck,
  Archive,
  ChevronLeft,
  Info,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export const SidebarQueue = () => {
  const {
    pendingQueue,
    currentId,
    dismissingId,
    selectCorrespondence,
    reorderQueue,
    setActiveView
  } = useCorrespondenceStore();

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newQueue = [...pendingQueue];
    const [draggedItem] = newQueue.splice(draggedIndex, 1);
    newQueue.splice(dropIndex, 0, draggedItem);

    reorderQueue(newQueue);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Helper for priority badges
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
            عاجل جداً
          </span>
        );
      case 'important':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            مهم
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            عادي
          </span>
        );
    }
  };

  // Helper for status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'annotated':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1B4B8A] border border-blue-200">
            <FileCheck className="w-3 h-3" />
            تم التهميش
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            معلّقة
          </span>
        );
    }
  };

  return (
    <aside className="w-full lg:w-96 bg-white border-l border-[#E2E6EC] flex flex-col h-[calc(100vh-65px)] sticky top-[65px] bg-islamic-pattern shadow-sm shrink-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#E2E6EC] bg-white/90 backdrop-blur-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold font-cairo text-[#1B4B8A] flex items-center gap-2">
            <span>طابور المراسلات</span>
            <span className="bg-[#1B4B8A] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingQueue.length}
            </span>
          </h2>
          <p className="text-[11px] text-[#6B7280]">
            اسحب لتعديل أولوية المعالجة أو انقر للفتح
          </p>
        </div>

        <div className="group relative">
          <button className="p-1.5 text-gray-400 hover:text-[#1B4B8A] hover:bg-gray-100 rounded-lg transition-colors">
            <Info className="w-4 h-4" />
          </button>
          <div className="absolute left-0 top-full mt-1 hidden group-hover:block w-48 bg-slate-900 text-white text-[11px] p-2.5 rounded-lg shadow-xl z-50 leading-relaxed border border-slate-700">
            💡 يمكنك سحب البطاقات لأعلى أو لأسفل لإعادة ترتيب الأولوية في الطابور.
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {pendingQueue.length === 0 ? (
          <div className="text-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#1E9E5A] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm font-cairo text-[#1A1F2B]">
              لا توجد مراسلات معلّقة حالياً
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              تم إنجاز كافة المعاملات وإحالتها بنجاح!
            </p>
          </div>
        ) : (
          pendingQueue.map((item, index) => {
            const isSelected = item.id === currentId;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            const isDismissing = item.id === dismissingId;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => selectCorrespondence(item.id)}
                className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                  isDismissing
                    ? 'animate-card-dismiss'
                    : isSelected
                    ? 'bg-gradient-to-br from-[#1B4B8A]/5 via-white to-[#C8952A]/5 border-[#1B4B8A] shadow-md ring-2 ring-[#1B4B8A]/20'
                    : isDragOver
                    ? 'border-[#C8952A] bg-amber-50/80 scale-[1.01]'
                    : isDragging
                    ? 'opacity-40 border-dashed border-gray-400'
                    : 'bg-white hover:bg-slate-50/80 border-[#E2E6EC] hover:border-gray-300 shadow-xs'
                }`}
              >
                {/* Active Sidebar Indicator Strip */}
                {isSelected && (
                  <div className="absolute right-0 top-3 bottom-3 w-1.5 bg-[#C8952A] rounded-l-full" />
                )}

                {/* Drag Handle & Reference Row */}
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-500 p-0.5 rounded hover:bg-gray-100 transition-colors"
                      title="اسحب لإعادة الترتيب"
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>

                    <span className="font-mono text-xs font-bold text-[#1B4B8A] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {item.refNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {getPriorityBadge(item.priority)}
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Subject Title */}
                <h3
                  className={`text-xs font-bold font-cairo leading-snug line-clamp-2 mb-2 ${
                    isSelected ? 'text-[#1B4B8A]' : 'text-[#1A1F2B]'
                  }`}
                >
                  {item.subject}
                </h3>

                {/* Sender Representative */}
                <div className="text-[11px] text-[#6B7280] font-medium flex items-center justify-between gap-1 mb-2">
                  <span className="truncate">{item.sender}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {item.type === 'internal' ? 'داخلية' : 'خارجية'}
                  </span>
                </div>

                {/* Date Row (Gregorian + Hijri) */}
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{item.dateGregorian}</span>
                  </div>
                  <span className="font-semibold text-gray-500">{item.dateHijri}</span>
                </div>

                {/* Tooltip on Hover / Drag */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 left-2 pointer-events-none">
                  <span className="text-[9px] bg-slate-800 text-white px-2 py-0.5 rounded-md shadow-md">
                    اسحب أو انقر
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer: View Archive Button */}
      <div className="p-3 border-t border-[#E2E6EC] bg-white">
        <button
          onClick={() => setActiveView('archive')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl bg-[#F7F8FA] hover:bg-[#1B4B8A] text-[#1B4B8A] hover:text-white border border-[#E2E6EC] transition-all group shadow-xs"
        >
          <Archive className="w-4 h-4 text-[#C8952A] group-hover:text-white transition-colors" />
          <span>عرض الأرشيف الإلكتروني (المعاملات المكتملة)</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>
    </aside>
  );
};
