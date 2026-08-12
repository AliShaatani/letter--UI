import { create } from 'zustand';
import { correspondenceService } from '../services/correspondenceService';

export const useCorrespondenceStore = create((set, get) => ({
  // Queue & Selection
  pendingQueue: [],
  archiveQueue: [],
  currentId: null,
  activeView: 'main', // 'main' | 'archive'
  isLoading: false,
  isDocumentLoading: false,

  // Animations & Transitions
  dismissingId: null, // ID of card being dismissed
  docAnimationClass: '', // '' | 'animate-doc-slide-out' | 'animate-doc-slide-in'

  // Filters
  filters: {
    status: 'all',
    type: 'all',
    department: 'all',
    priority: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  },
  isFilterPanelOpen: false,

  // Archive filters & state
  archiveFilters: {
    department: 'all',
    search: ''
  },
  selectedArchiveDoc: null,

  // Document Navigation & Zoom
  activePage: 1,
  zoomLevel: 100,

  // Annotation Tools State
  annotationTool: 'pen', // 'select' | 'pen' | 'highlighter' | 'text' | 'rectangle' | 'circle' | 'arrow' | 'eraser'
  strokeColor: '#1B4B8A', // '#1B4B8A' | '#C8952A' | '#DC2626' | '#1A1F2B' | '#1E9E5A'
  strokeWidth: 4,
  
  // Annotation storage per doc and per page: { [docId]: { [pageNumber]: [shapes] } }
  annotationsMap: {},
  // Undo/Redo history: { [docId_pageNumber]: { past: [], future: [] } }
  historyMap: {},

  // Modals & UI States
  isRoutingModalOpen: false,
  toast: null, // { message: '', type: 'success'|'error'|'info', id: number }

  // ----------------------------------------------------
  // Actions
  // ----------------------------------------------------

  // Fetch pending queue
  loadQueue: async () => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const queue = await correspondenceService.getPendingQueue(filters);
      const currentId = get().currentId;
      
      let nextId = currentId;
      if (!queue.some(item => item.id === currentId)) {
        nextId = queue.length > 0 ? queue[0].id : null;
      }

      set({ 
        pendingQueue: queue, 
        currentId: nextId, 
        activePage: 1,
        isLoading: false 
      });
    } catch (err) {
      console.error('Failed to load queue:', err);
      set({ isLoading: false });
    }
  },

  // Fetch archive
  loadArchive: async () => {
    try {
      const { archiveFilters } = get();
      const archive = await correspondenceService.getArchive(archiveFilters);
      set({ archiveQueue: archive });
    } catch (err) {
      console.error('Failed to load archive:', err);
    }
  },

  // Select item from queue with smooth slide transition
  selectCorrespondence: (id) => {
    const { currentId } = get();
    if (id === currentId) return;

    set({ docAnimationClass: 'animate-doc-slide-out' });
    
    setTimeout(() => {
      set({ currentId: id, activePage: 1, docAnimationClass: 'animate-doc-slide-in' });
      setTimeout(() => {
        set({ docAnimationClass: '' });
      }, 450);
    }, 250);
  },

  // Reorder queue via drag-and-drop
  reorderQueue: async (newQueue) => {
    set({ pendingQueue: newQueue });
    await correspondenceService.saveQueueOrder(newQueue);
  },

  // Filter setters
  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    }));
    get().loadQueue();
  },

  resetFilters: () => {
    set({
      filters: {
        status: 'all',
        type: 'all',
        department: 'all',
        priority: 'all',
        search: '',
        dateFrom: '',
        dateTo: ''
      }
    });
    get().loadQueue();
  },

  toggleFilterPanel: () => {
    set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen }));
  },

  setArchiveFilter: (key, value) => {
    set((state) => ({
      archiveFilters: { ...state.archiveFilters, [key]: value }
    }));
    get().loadArchive();
  },

  setActiveView: (view) => {
    set({ activeView: view });
    if (view === 'archive') {
      get().loadArchive();
    } else {
      get().loadQueue();
    }
  },

  setSelectedArchiveDoc: (doc) => {
    set({ selectedArchiveDoc: doc });
  },

  // Document Navigation
  setActivePage: (page) => {
    set({ activePage: page });
  },

  setZoomLevel: (zoom) => {
    set({ zoomLevel: Math.max(50, Math.min(200, zoom)) });
  },

  // Tools & Styling
  setAnnotationTool: (tool) => {
    set({ annotationTool: tool });
  },

  setStrokeColor: (color) => {
    set({ strokeColor: color });
  },

  setStrokeWidth: (width) => {
    set({ strokeWidth: width });
  },

  // Annotation Manipulation
  updatePageAnnotations: (docId, pageNum, newShapes) => {
    set((state) => {
      const key = `${docId}_${pageNum}`;
      const existingDocAnn = state.annotationsMap[docId] || {};
      const currentShapes = existingDocAnn[pageNum] || [];

      // Push to history before updating
      const currentHistory = state.historyMap[key] || { past: [], future: [] };
      const newHistory = {
        past: [...currentHistory.past, currentShapes],
        future: []
      };

      const newDocAnn = {
        ...existingDocAnn,
        [pageNum]: newShapes
      };

      // Also notify service asynchronously
      correspondenceService.saveAnnotations(docId, newDocAnn);

      return {
        annotationsMap: {
          ...state.annotationsMap,
          [docId]: newDocAnn
        },
        historyMap: {
          ...state.historyMap,
          [key]: newHistory
        }
      };
    });
  },

  clearPageAnnotations: (docId, pageNum) => {
    const { updatePageAnnotations } = get();
    updatePageAnnotations(docId, pageNum, []);
    get().showToast('تم مسح جميع التهميشات من هذه الصفحة', 'info');
  },

  undoAnnotation: (docId, pageNum) => {
    set((state) => {
      const key = `${docId}_${pageNum}`;
      const history = state.historyMap[key];
      if (!history || history.past.length === 0) return state;

      const previousShapes = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, -1);

      const existingDocAnn = state.annotationsMap[docId] || {};
      const currentShapes = existingDocAnn[pageNum] || [];

      const newDocAnn = {
        ...existingDocAnn,
        [pageNum]: previousShapes
      };

      return {
        annotationsMap: {
          ...state.annotationsMap,
          [docId]: newDocAnn
        },
        historyMap: {
          ...state.historyMap,
          [key]: {
            past: newPast,
            future: [currentShapes, ...history.future]
          }
        }
      };
    });
  },

  redoAnnotation: (docId, pageNum) => {
    set((state) => {
      const key = `${docId}_${pageNum}`;
      const history = state.historyMap[key];
      if (!history || history.future.length === 0) return state;

      const nextShapes = history.future[0];
      const newFuture = history.future.slice(1);

      const existingDocAnn = state.annotationsMap[docId] || {};
      const currentShapes = existingDocAnn[pageNum] || [];

      const newDocAnn = {
        ...existingDocAnn,
        [pageNum]: nextShapes
      };

      return {
        annotationsMap: {
          ...state.annotationsMap,
          [docId]: newDocAnn
        },
        historyMap: {
          ...state.historyMap,
          [key]: {
            past: [...history.past, currentShapes],
            future: newFuture
          }
        }
      };
    });
  },

  // Finalize & Route
  openRoutingModal: () => set({ isRoutingModalOpen: true }),
  closeRoutingModal: () => set({ isRoutingModalOpen: false }),

  finalizeAndRouteCurrent: async ({ signature, referTo, note }) => {
    const { currentId, pendingQueue } = get();
    if (!currentId) return;

    try {
      // 1. Close modal and trigger exit slide animations
      set({ 
        isRoutingModalOpen: false,
        dismissingId: currentId,
        docAnimationClass: 'animate-doc-slide-out'
      });

      // 2. Perform backend service routing in parallel
      const resultPromise = correspondenceService.finalizeAndRoute(currentId, {
        signature,
        referTo,
        note
      });

      // 3. Wait 300ms for exit animation
      await new Promise((res) => setTimeout(res, 300));
      const result = await resultPromise;

      const remaining = pendingQueue.filter((item) => item.id !== currentId);
      const nextItem = remaining.length > 0 ? remaining[0] : null;
      const deptNames = Array.isArray(referTo) ? referTo.join('، ') : referTo;

      // 4. Update queue state & trigger entrance animation for next item
      set({
        pendingQueue: remaining,
        currentId: nextItem ? nextItem.id : null,
        activePage: 1,
        dismissingId: null,
        docAnimationClass: 'animate-doc-slide-in'
      });

      // 5. Reset animation class after entrance finishes
      setTimeout(() => {
        set({ docAnimationClass: '' });
      }, 450);

      get().showToast(`تمت الإحالة والتوجيه إلى [${deptNames || 'الإدارة المعنية'}] بنجاح 🎉`, 'success');
      return result;
    } catch (err) {
      console.error('Error finalizing correspondence:', err);
      set({ isDocumentLoading: false, isRoutingModalOpen: false, dismissingId: null, docAnimationClass: '' });
      get().showToast(err.message || 'حدث خطأ أثناء إجراء الإحالة', 'error');
    }
  },

  // System & Toast Actions
  resetToMockData: async () => {
    set({ isLoading: true });
    await correspondenceService.resetToMockData();
    await get().loadQueue();
    await get().loadArchive();
    get().showToast('تمت إعادة ضبط البيانات الافتراضية للنظام بنجاح', 'success');
  },

  showToast: (message, type = 'success') => {
    const toast = { message, type, id: Date.now() };
    set({ toast });
    setTimeout(() => {
      set((state) => (state.toast?.id === toast.id ? { toast: null } : state));
    }, 4000);
  }
}));
