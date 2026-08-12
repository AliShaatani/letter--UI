import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';
import { pdfBlobStore } from '../services/pdfBlobStore';
import { pdfMemoryStore } from '../services/pdfMemoryStore';
import { AnnotationCanvas } from './AnnotationCanvas';
import { SignatureModal } from './SignatureModal';
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
  Lock,
  FileText,
  UploadCloud,
  FileSignature,
  FilePlus
} from 'lucide-react';

// Configure PDF.js Worker using Vite's static asset URL importer
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const DocumentRenderer = ({ item, readOnly = false }) => {
  const {
    activePage,
    setActivePage,
    zoomLevel,
    setZoomLevel,
    annotationTool,
    setAnnotationTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    undoAnnotation,
    redoAnnotation,
    clearPageAnnotations,
    updatePageAnnotations,
    annotationsMap,
    openRoutingModal,
    openAttachModal,
    docAnimationClass
  } = useCorrespondenceStore();

  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(item?.pageCount || 1);
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(null);
  const [docDimensions, setDocDimensions] = useState({ width: 800, height: 1130 });

  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  // 1. Load PDF Document safely from Memory, IndexedDB, BlobURL, or File
  useEffect(() => {
    let isCancelled = false;
    setIsPdfLoading(true);
    setPdfError(null);

    const loadPdf = async () => {
      try {
        let resolvedSource = null;

        // 1. Check synchronous memory store
        if (item?.id) {
          resolvedSource = pdfMemoryStore.getFile(item.id);
        }

        // 2. Check IndexedDB store
        if (!resolvedSource && item?.id) {
          resolvedSource = await pdfBlobStore.getPdf(item.id);
        }

        // 3. Fallback to item properties
        if (!resolvedSource) {
          resolvedSource = item?.pdfBlobUrl || item?.pdfUrl || item?.pdfDataUrl;
        }

        // If item has no file attached
        if (!resolvedSource) {
          setPdfDoc(null);
          setIsPdfLoading(false);
          return;
        }

        let loadingTask;
        if (resolvedSource instanceof ArrayBuffer) {
          loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(resolvedSource) });
        } else if (resolvedSource instanceof Blob || resolvedSource instanceof File) {
          const arrayBuffer = await resolvedSource.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        } else if (typeof resolvedSource === 'string' && resolvedSource.startsWith('data:')) {
          const base64Parts = resolvedSource.split(',');
          const base64Str = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
          const binaryStr = window.atob(base64Str);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes });
        } else if (typeof resolvedSource === 'string' && resolvedSource.startsWith('blob:')) {
          const res = await fetch(resolvedSource);
          const arrayBuffer = await res.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        } else if (typeof resolvedSource === 'string' && resolvedSource.trim().length > 0) {
          loadingTask = pdfjsLib.getDocument(resolvedSource);
        } else {
          setPdfDoc(null);
          setIsPdfLoading(false);
          return;
        }

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        item.pageCount = doc.numPages; // sync page count
        item.hasFile = true;
        setIsPdfLoading(false);
      } catch (err) {
        console.error('Error loading PDF document:', err);
        if (!isCancelled) {
          setPdfError('تعذر تحميل ملف الـ PDF الأصلي');
          setIsPdfLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [item?.id, item?.pdfBlobUrl, item?.pdfUrl, item?.pdfDataUrl, item?.hasFile]);

  // 2. Render Page onto Canvas whenever activePage, pdfDoc changes
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isSubscribed = true;

    const renderPage = async () => {
      try {
        const pageNumber = Math.min(Math.max(1, activePage), pdfDoc.numPages);
        const page = await pdfDoc.getPage(pageNumber);

        if (!isSubscribed) return;

        // Cancel previous render task if active
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        // Calculate aspect ratio & set canonical document size (e.g. width = 800)
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const canonicalWidth = 800;
        const canonicalHeight = Math.round(canonicalWidth * (unscaledViewport.height / unscaledViewport.width));

        setDocDimensions({ width: canonicalWidth, height: canonicalHeight });

        // High resolution rendering for crisp text (2x pixel density)
        const renderScale = 2.0;
        const viewport = page.getViewport({ scale: (canonicalWidth / unscaledViewport.width) * renderScale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering PDF page:', err);
        }
      }
    };

    renderPage();

    return () => {
      isSubscribed = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, activePage]);

  // Handle signature or stamp insertion into current page canvas
  const handleInsertSignatureOrStamp = (itemToInsert) => {
    if (!item?.id) return;
    const currentShapes = annotationsMap[item.id]?.[activePage] || [];
    const newShape = {
      id: `sig_${Date.now()}`,
      type: itemToInsert.type, // 'signature' | 'stamp'
      src: itemToInsert.src,
      x: docDimensions.width / 2 - (itemToInsert.width || 180) / 2,
      y: docDimensions.height - 180,
      width: itemToInsert.width || 180,
      height: itemToInsert.height || 75
    };
    updatePageAnnotations(item.id, activePage, [...currentShapes, newShape]);
  };

  if (!item) return null;

  // Calm placeholder when correspondence has no PDF attached
  if (!pdfDoc && !isPdfLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/80 min-h-[calc(100vh-65px)] relative">
        {/* Top Quick Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#E2E6EC] px-6 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#1B4B8A] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 font-mono">
              {item.refNumber}
            </span>
            <h2 className="font-bold font-cairo text-[#1A1F2B] truncate max-w-md">
              {item.subject}
            </h2>
          </div>
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            بلا ملف مرفق
          </span>
        </div>

        {/* Calm Upload Prompt Card */}
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#E2E6EC] shadow-lg animate-fade-in relative text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-[#C8952A] shadow-xs">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold font-cairo text-[#1B4B8A] mb-2">
            لم يُرفق ملف PDF لهذه المراسلة بعد
          </h3>

          <p className="text-xs text-gray-500 leading-relaxed mb-6">
            بيانات المعاملة الإدارية مسجلة في النظام. يمكنك إرفاق مستند الـ PDF الأصلي الآن للبدء في تهميشه والتوقيع عليه.
          </p>

          {!readOnly && (
            <button
              onClick={() => openAttachModal(item.id)}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 text-xs font-bold font-cairo text-white bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] hover:from-[#123a6b] hover:to-[#0f2e55] rounded-xl shadow-md transition-all border border-[#C8952A]/40"
            >
              <UploadCloud className="w-4 h-4 text-[#E0B863]" />
              <span>رفع ملف PDF لهذه المراسلة</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const scale = zoomLevel / 100;
  const docWidth = docDimensions.width;
  const docHeight = docDimensions.height;

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
            <span className="text-gray-500">{numPages}</span>
          </span>
          <button
            disabled={activePage >= numPages}
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
        {isPdfLoading ? (
          <div className="w-[800px] h-[1050px] bg-white rounded-xl shadow-xl p-8 animate-pulse flex flex-col justify-center items-center border border-gray-200">
            <FileText className="w-16 h-16 text-[#1B4B8A] animate-bounce mb-4" />
            <p className="text-sm font-bold font-cairo text-[#1B4B8A]">
              جاري معالجة وعرض صفحات مستند الـ PDF الأصلي...
            </p>
          </div>
        ) : (
          <div
            className={`relative bg-white rounded-lg shadow-2xl transition-all border border-gray-300 ${docAnimationClass}`}
            style={{
              width: docWidth * scale,
              height: docHeight * scale
            }}
          >
            {/* Real PDF Rendered Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 select-none pointer-events-none rounded-lg"
              style={{
                width: docWidth * scale,
                height: docHeight * scale
              }}
            />

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

            {/* Signature & Official Stamp Tool */}
            <button
              onClick={() => setIsSigModalOpen(true)}
              className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#C8952A] hover:text-amber-900 border border-amber-200 transition-all flex items-center justify-center shadow-xs"
              title="إدراج توقيع يدوي أو ختم رسمي معتمد"
            >
              <FileSignature className="w-5 h-5" />
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

      {/* Signature & Stamp Modal */}
      <SignatureModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onInsert={handleInsertSignatureOrStamp}
      />

      {/* ---------------------------------------------------- */}
      {/* Prominent Fixed Bottom-Right Action Button */}
      {/* ---------------------------------------------------- */}
      {!readOnly && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={openRoutingModal}
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#1B4B8A] to-[#123a6b] text-[#ffffff] font-cairo font-bold text-base shadow-2xl hover:shadow-[#1B4B8A]/40 hover:scale-105 active:scale-95 transition-all border border-[#C8952A]/40 pulse-glow"
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
