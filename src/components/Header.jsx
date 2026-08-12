import React from 'react';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';
import { DEPARTMENTS } from '../services/correspondenceService';
import {
  FileText,
  Filter,
  Search,
  RotateCcw,
  Archive,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Building2,
  Calendar,
  AlertTriangle,
  Upload
} from 'lucide-react';

export const Header = () => {
  const {
    pendingQueue,
    archiveQueue,
    filters,
    setFilter,
    resetFilters,
    isFilterPanelOpen,
    toggleFilterPanel,
    activeView,
    setActiveView,
    resetToMockData,
    showToast,
    uploadPdf
  } = useCorrespondenceStore();

  const pendingCount = pendingQueue.length;
  const completedCount = archiveQueue.length;
  const totalCount = pendingCount + completedCount || 1;
  const progressPercent = Math.min(100, Math.round((completedCount / totalCount) * 100));

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'search' || key === 'dateFrom' || key === 'dateTo') return val !== '';
    return val !== 'all';
  }).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E6EC] shadow-xs transition-all">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          {/* Right Section: Logo & System Title */}
          <div className="flex items-center gap-3">
            {/* Logo Emblem Image */}
            <div className="relative w-10 h-10 shrink-0">
              <img src="/logo.png" alt="تطبيق التهميش" className="w-full h-full object-contain filter drop-shadow-sm" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold font-cairo text-[#1B4B8A] tracking-tight">
                  نظام تهميش وتوجيه المراسلات
                </h1>
                <span className="bg-[#C8952A]/10 text-[#C8952A] text-xs font-semibold px-2 py-0.5 rounded-full border border-[#C8952A]/20">
                  إصدار 2.5
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                منظومة المعاملات والمراسلات الإدارية الموحدة
              </p>
            </div>
          </div>

          {/* Middle Section: Queue Progress Bar */}
          {activeView === 'main' && (
            <div className="hidden md:flex flex-col gap-1 min-w-[220px] max-w-[300px] bg-[#F7F8FA] p-2.5 rounded-xl border border-[#E2E6EC]">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#1A1F2B]">
                  متبقٍ <span className="text-[#1B4B8A] font-bold text-sm">{pendingCount}</span> من <span className="text-gray-500">{totalCount}</span> مراسلة
                </span>
                <span className="text-[#C8952A] font-cairo font-bold">{progressPercent}% مكتمل</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-l from-[#C8952A] to-[#1B4B8A] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Left Section: Controls & Actions */}
          <div className="flex items-center gap-2 shrink-0 me-auto sm:me-0">
            {/* PDF Upload Button */}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              id="header-upload-input"
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
              htmlFor="header-upload-input"
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl border border-[#E2E6EC] bg-white text-[#1A1F2B] hover:bg-gray-50 shadow-xs cursor-pointer transition-all"
              title="رفع ملف PDF جديد"
            >
              <Upload className="w-4 h-4 text-[#C8952A]" />
              <span className="hidden sm:inline">رفع ملف PDF</span>
            </label>

            {/* Filter Toggle Button */}
            <button
              onClick={toggleFilterPanel}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                isFilterPanelOpen || activeFiltersCount > 0
                  ? 'bg-[#1B4B8A] text-white border-[#1B4B8A] shadow-sm'
                  : 'bg-white text-[#1A1F2B] border-[#E2E6EC] hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>الفلاتر</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#C8952A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              {isFilterPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* View Switcher: Main Queue vs Archive */}
            <div className="flex items-center bg-[#F7F8FA] p-1 rounded-xl border border-[#E2E6EC]">
              <button
                onClick={() => setActiveView('main')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeView === 'main'
                    ? 'bg-[#1B4B8A] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1A1F2B]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>المعاملات الجارية</span>
              </button>
              <button
                onClick={() => setActiveView('archive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeView === 'archive'
                    ? 'bg-[#1B4B8A] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1A1F2B]'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>الأرشيف</span>
              </button>
            </div>

            {/* System Mock Data Reset */}
            <button
              onClick={resetToMockData}
              title="إعادة ضبط البيانات الافتراضية"
              className="p-2 text-gray-500 hover:text-[#1B4B8A] hover:bg-gray-100 rounded-xl transition-colors border border-transparent hover:border-gray-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Horizontal Filter Bar */}
        {isFilterPanelOpen && (
          <div className="mt-3 pt-3 border-t border-[#E2E6EC] animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Quick Search */}
              <div className="lg:col-span-2 relative">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  بحث سريع
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilter('search', e.target.value)}
                    placeholder="رقم المراسلة، اسم المرسل، أو الموضوع..."
                    className="w-full pl-3 pr-9 py-1.5 text-xs rounded-lg border border-[#E2E6EC] focus:border-[#1B4B8A] focus:ring-1 focus:ring-[#1B4B8A] outline-none transition-all"
                  />
                  {filters.search && (
                    <button
                      onClick={() => setFilter('search', '')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  الحالة
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilter('status', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E2E6EC] focus:border-[#1B4B8A] outline-none bg-white font-medium"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">معلّقة</option>
                  <option value="annotated">تم التهميش</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  نوع المراسلة
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilter('type', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E2E6EC] focus:border-[#1B4B8A] outline-none bg-white font-medium"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="internal">مراسلة داخلية</option>
                  <option value="external">مراسلة خارجية</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  الإدارة المُحالة إليها
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilter('department', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E2E6EC] focus:border-[#1B4B8A] outline-none bg-white font-medium"
                >
                  <option value="all">جميع الإدارات</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  درجة الاستعجال
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilter('priority', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E2E6EC] focus:border-[#1B4B8A] outline-none bg-white font-medium"
                >
                  <option value="all">جميع الدرجات</option>
                  <option value="urgent">عاجل 🔴</option>
                  <option value="important">مهم 🟡</option>
                  <option value="normal">عادي ⚪</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Row */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs">
                <span className="text-gray-500">
                  تم تطبيق {activeFiltersCount} من الفلاتر
                </span>
                <button
                  onClick={resetFilters}
                  className="text-[#DC2626] font-semibold hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  إعادة إعادة ضبط الفلاتر
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
