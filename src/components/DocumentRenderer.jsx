import React, { useState } from 'react';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';
import { AnnotationCanvas } from './AnnotationCanvas';
import {
  PenTool,
  Highlighter,
  Type,
  Square,
  Circle as CircleIcon,
  ArrowUpLeft,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Send,
  Sparkles,
  Building,
  CheckCircle2,
  Lock,
  MousePointer
} from 'lucide-react';

export const DocumentRenderer = ({ item, readOnly = false }) => {
  const {
    activePage,
    setActivePage,
    zoomLevel,
    setZoomLevel,
    annotationTool,
    setAnnotationTool,
    strokeColor,
    strokeColorSet,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    undoAnnotation,
    redoAnnotation,
    clearPageAnnotations,
    openRoutingModal,
    isDocumentLoading,
    docAnimationClass
  } = useCorrespondenceStore();

  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);

  if (!item) return null;

  const pageCount = item.pageCount || 1;
  const currentPageData = item.documentContent?.pages?.find(
    (p) => p.pageNumber === activePage
  ) || item.documentContent?.pages?.[0];

  const scale = zoomLevel / 100;
  const docWidth = 820;
  const docHeight = 1120;

  const colors = [
    { label: 'أزرق حكومي', value: '#1B4B8A', bg: 'bg-[#1B4B8A]' },
    { label: 'ذهبي إسلامي', value: '#C8952A', bg: 'bg-[#C8952A]' },
    { label: 'أحمر عاجل', value: '#DC2626', bg: 'bg-[#DC2626]' },
    { label: 'أسود رسمي', value: '#1A1F2B', bg: 'bg-[#1A1F2B]' },
    { label: 'أخضر موثق', value: '#1E9E5A', bg: 'bg-[#1E9E5A]' }
  ];

  const strokeWidths = [
    { label: 'رفيع', value: 2 },
    { label: 'متوسط', value: 4 },
    { label: 'عريض', value: 7 },
    { label: 'سميك', value: 12 }
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-slate-100/70 relative">
      {/* ---------------------------------------------------- */}
      {/* Top Floating Control Bar: Zoom & Page Navigation */}
      {/* ---------------------------------------------------- */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#E2E6EC] px-4 py-2 flex items-center justify-between shadow-xs">
        {/* Document Quick Metadata */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[#1B4B8A] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 font-mono">
            {item.refNumber}
          </span>
          <h2 className="font-bold font-cairo text-[#1A1F2B] truncate max-w-md hidden sm:block">
            {item.subject}
          </h2>
          {readOnly && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
              <Lock className="w-3 h-3" />
              عرض للقراءة فقط (مؤرشف)
            </span>
          )}
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-2 bg-[#F7F8FA] p-1 rounded-xl border border-[#E2E6EC]">
          <button
            disabled={activePage <= 1}
            onClick={() => setActivePage(activePage - 1)}
            className="p-1.5 text-gray-600 hover:text-[#1B4B8A] disabled:opacity-30 disabled:hover:text-gray-600 rounded-lg hover:bg-white transition-all"
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-[#1A1F2B] px-2 font-cairo">
            صفحة <span className="text-[#1B4B8A]">{activePage}</span> من{' '}
            <span className="text-gray-500">{pageCount}</span>
          </span>
          <button
            disabled={activePage >= pageCount}
            onClick={() => setActivePage(activePage + 1)}
            className="p-1.5 text-gray-600 hover:text-[#1B4B8A] disabled:opacity-30 disabled:hover:text-gray-600 rounded-lg hover:bg-white transition-all"
            title="الصفحة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-[#F7F8FA] p-1 rounded-xl border border-[#E2E6EC]">
          <button
            onClick={() => setZoomLevel(zoomLevel - 15)}
            className="p-1.5 text-gray-600 hover:text-[#1B4B8A] rounded-lg hover:bg-white transition-all"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-gray-600 px-1 font-mono min-w-[40px] text-center">
            {zoomLevel}%
          </span>
          <button
            onClick={() => setZoomLevel(zoomLevel + 15)}
            className="p-1.5 text-gray-600 hover:text-[#1B4B8A] rounded-lg hover:bg-white transition-all"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(100)}
            className="p-1.5 text-gray-600 hover:text-[#1B4B8A] rounded-lg hover:bg-white transition-all border-r border-gray-200"
            title="إعادة التعيين (100%)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Main PDF Page Display Area with Konva Layer */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start relative">
        {isDocumentLoading ? (
          <div className="w-[820px] h-[1050px] bg-white rounded-xl shadow-xl p-8 animate-pulse flex flex-col justify-between border border-gray-200">
            <div className="space-y-4">
              <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-6 bg-slate-100 rounded-lg w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-1/2"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-5/6"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-2/3"></div>
            </div>
            <div className="h-16 bg-slate-100 rounded-lg w-full"></div>
          </div>
        ) : (
          <div
            className={`relative bg-white rounded-lg shadow-2xl transition-all border border-gray-300 ${docAnimationClass}`}
            style={{
              width: docWidth * scale,
              height: docHeight * scale
            }}
          >
            {/* Render Crisp Arabic Document Sheet Content */}
            <div
              className="absolute inset-0 p-10 sm:p-12 flex flex-col justify-between select-none pointer-events-none overflow-hidden bg-white"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top right',
                width: docWidth,
                height: docHeight
              }}
            >
              {/* Official Header */}
              <div>
                <div className="flex items-center justify-between border-b-2 border-[#1B4B8A] pb-4 mb-6">
                  <div>
                    <h3 className="font-bold text-base font-cairo text-[#1B4B8A]">
                      {item.documentContent?.headerTitle || 'جمهورية مصر العربية'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.documentContent?.docTypeLabel || 'مراسلة رسمية توجيهية'}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-[#C8952A] flex items-center justify-center mx-auto mb-1 bg-amber-50/50">
                      <Building className="w-6 h-6 text-[#C8952A]" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">ختم المعتمد</span>
                  </div>

                  <div className="text-left font-mono text-xs text-gray-600 space-y-1">
                    <div>
                      <span className="text-gray-400">الرقم:</span>{' '}
                      <span className="font-bold text-[#1B4B8A]">{item.refNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">التاريخ:</span>{' '}
                      <span>{item.dateGregorian}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">الموافق:</span>{' '}
                      <span>{item.dateHijri}</span>
                    </div>
                  </div>
                </div>

                {/* Page Title */}
                {currentPageData?.contentTitle && (
                  <h4 className="text-lg font-bold font-cairo text-center text-[#1B4B8A] mb-6 bg-slate-50 py-2 px-4 rounded-xl border border-slate-200">
                    {currentPageData.contentTitle}
                  </h4>
                )}

                {/* Main Paragraphs */}
                <div className="space-y-4 text-sm text-[#1A1F2B] leading-relaxed font-ibm">
                  {currentPageData?.bodyParagraphs?.map((para, idx) => (
                    <p key={idx} className="indent-4 text-justify">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Render Table Data if present on this page */}
                {currentPageData?.tableData && (
                  <div className="my-6 border border-gray-300 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-[#1B4B8A] text-white font-cairo">
                        <tr>
                          {currentPageData.tableData.headers.map((h, i) => (
                            <th key={i} className="p-2.5 border-b font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 font-ibm">
                        {currentPageData.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-gray-50">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2.5 font-medium">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {currentPageData.tableData.total && (
                          <tr className="bg-amber-50 font-bold border-t-2 border-[#C8952A]">
                            <td colSpan={2} className="p-2.5 text-left">
                              الإجمالي الكلي:
                            </td>
                            <td colSpan={2} className="p-2.5 text-[#1B4B8A]">
                              {currentPageData.tableData.total}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Document Signature Footer Block */}
              <div className="pt-6 border-t border-gray-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400">المرسل:</span>{' '}
                  <span className="font-bold text-[#1A1F2B]">{item.sender}</span>
                  <div className="text-gray-500 font-medium">
                    {item.senderRepresentative}
                  </div>
                </div>

                {currentPageData?.signatureBlock && (
                  <div className="text-center bg-slate-50 p-3 rounded-xl border border-slate-200 min-w-[200px]">
                    <div className="font-bold text-[#1B4B8A]">
                      {currentPageData.signatureBlock.title}
                    </div>
                    <div className="text-gray-600 font-medium text-xs mt-1">
                      {currentPageData.signatureBlock.name}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      توقيع معتمد إلكترونياً
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Konva Interactive Annotation Layer */}
            <div className="absolute inset-0 z-10">
              <AnnotationCanvas
                docId={item.id}
                pageNum={activePage}
                width={docWidth}
                height={docHeight}
                scale={scale}
                readOnly={readOnly}
              />
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* Floating Glassmorphism Annotation Toolbar */}
      {/* ---------------------------------------------------- */}
      {!readOnly && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-[#E2E6EC] shadow-2xl flex flex-col gap-3 animate-slide-in">
          {/* Main Drawing Tools */}
          <div className="flex flex-col gap-1.5 border-b border-gray-200 pb-2">
            <button
              onClick={() => setAnnotationTool('pen')}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                annotationTool === 'pen'
                  ? 'bg-[#1B4B8A] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="قلم حر (Freehand)"
            >
              <PenTool className="w-5 h-5" />
            </button>

            <button
              onClick={() => setAnnotationTool('highlighter')}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                annotationTool === 'highlighter'
                  ? 'bg-[#C8952A] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="قلم تمييز شفاف (Highlighter)"
            >
              <Highlighter className="w-5 h-5" />
            </button>

            <button
              onClick={() => setAnnotationTool('text')}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                annotationTool === 'text'
                  ? 'bg-[#1B4B8A] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="إضافة نص (Text)"
            >
              <Type className="w-5 h-5" />
            </button>

            {/* Shapes Dropdown / Toggle */}
            <div className="relative">
              <button
                onClick={() => setShapeMenuOpen(!shapeMenuOpen)}
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center w-full ${
                  ['rectangle', 'circle', 'arrow'].includes(annotationTool)
                    ? 'bg-[#1B4B8A] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="أشكال هندسية"
              >
                {annotationTool === 'circle' ? (
                  <CircleIcon className="w-5 h-5" />
                ) : annotationTool === 'arrow' ? (
                  <ArrowUpLeft className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>

              {shapeMenuOpen && (
                <div className="absolute right-full top-0 mr-2 bg-white p-2 rounded-xl shadow-2xl border border-gray-200 flex gap-1 z-50 animate-fade-in">
                  <button
                    onClick={() => {
                      setAnnotationTool('rectangle');
                      setShapeMenuOpen(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Square className="w-4 h-4 text-[#1B4B8A]" />
                    مستطيل
                  </button>
                  <button
                    onClick={() => {
                      setAnnotationTool('circle');
                      setShapeMenuOpen(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 flex items-center gap-1.5 text-xs font-bold"
                  >
                    <CircleIcon className="w-4 h-4 text-[#C8952A]" />
                    دائرة
                  </button>
                  <button
                    onClick={() => {
                      setAnnotationTool('arrow');
                      setShapeMenuOpen(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 flex items-center gap-1.5 text-xs font-bold"
                  >
                    <ArrowUpLeft className="w-4 h-4 text-[#DC2626]" />
                    سهم
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setAnnotationTool('eraser')}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                annotationTool === 'eraser'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="ممحاة (Eraser)"
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>

          {/* Color Palette Picker */}
          <div className="flex flex-col gap-1.5 items-center border-b border-gray-200 pb-2">
            <span className="text-[9px] font-bold text-gray-400">اللون</span>
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => setStrokeColor(c.value)}
                className={`w-6 h-6 rounded-full ${c.bg} transition-all ${
                  strokeColor === c.value
                    ? 'ring-2 ring-offset-2 ring-[#1B4B8A] scale-110'
                    : 'opacity-80 hover:opacity-100'
                }`}
                title={c.label}
              />
            ))}
          </div>

          {/* Stroke Thickness Picker */}
          <div className="flex flex-col gap-1 items-center border-b border-gray-200 pb-2">
            <span className="text-[9px] font-bold text-gray-400">السماكة</span>
            <div className="flex flex-col gap-1">
              {strokeWidths.map((w) => (
                <button
                  key={w.value}
                  onClick={() => setStrokeWidth(w.value)}
                  className={`w-6 h-5 flex items-center justify-center rounded transition-all ${
                    strokeWidth === w.value ? 'bg-[#1B4B8A]/10 text-[#1B4B8A] font-bold' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  title={w.label}
                >
                  <span
                    className="bg-current rounded-full"
                    style={{ width: `${w.value + 2}px`, height: `${w.value + 2}px` }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Undo / Redo / Clear Page */}
          <div className="flex flex-col gap-1.5 pt-1">
            <button
              onClick={() => undoAnnotation(item.id, activePage)}
              className="p-2 text-gray-600 hover:text-[#1B4B8A] hover:bg-gray-100 rounded-xl transition-colors"
              title="تراجع (Undo)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => redoAnnotation(item.id, activePage)}
              className="p-2 text-gray-600 hover:text-[#1B4B8A] hover:bg-gray-100 rounded-xl transition-colors"
              title="إعادة (Redo)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => clearPageAnnotations(item.id, activePage)}
              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
              title="مسح جميع تهميشات الصفحة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Prominent Fixed Bottom-Right Action Button */}
      {/* ---------------------------------------------------- */}
      {!readOnly && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={openRoutingModal}
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] text-white font-cairo font-bold text-base shadow-2xl hover:shadow-[#1B4B8A]/40 hover:scale-105 active:scale-95 transition-all border border-[#C8952A]/40 pulse-glow"
          >
            <div className="w-7 h-7 rounded-lg bg-[#C8952A] flex items-center justify-center text-white shadow-xs">
              <Send className="w-4 h-4" />
            </div>
            <span>إنهاء التهميش والإحالة</span>
            <Sparkles className="w-5 h-5 text-[#E0B863]" />
          </button>
        </div>
      )}
    </div>
  );
};
