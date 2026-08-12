// LocalStorage Keys
const STORAGE_KEY_PENDING = 'moraslat_pending_queue_v2';
const STORAGE_KEY_ARCHIVE = 'moraslat_archive_queue_v2';

// Available Departments
export const DEPARTMENTS = [
  { id: 'dept-1', name: 'مكتب المدير العام', code: 'DIR' },
  { id: 'dept-2', name: 'الشؤون الثقافية والأنشطة', code: 'CUL' },
  { id: 'dept-3', name: 'الشؤون المالية والحسابات', code: 'FIN' },
  { id: 'dept-4', name: 'الموارد البشرية والتدريب', code: 'HR' },
  { id: 'dept-5', name: 'الإدارة القانونية والحوكمة', code: 'LEG' },
  { id: 'dept-6', name: 'العلاقات العامة والإعلام', code: 'PR' },
  { id: 'dept-7', name: 'التخطيط والمتابعة والتطوير', code: 'PLN' },
  { id: 'dept-8', name: 'المراجعة والتدقيق الداخلي', code: 'AUD' },
];

// Preset Quick Note Suggestions
export const PRESET_NOTES = [
  'للاطلاع والافادة، واتخاذ اللازم حسب الأنظمة والتطبيقات المعمول بها.',
  'للدراسة وإبداء الرأي الفني والقانوني قبل اتخاذ القرار النهائي.',
  'للاعتماد الفوري وإكمال الإجراءات المالية والإدارية حسب الأصول.',
  'للحفظ بالأرشيف الإلكتروني بعد الإحاطة والمتابعة.',
  'عاجل جداً: يرجى موافاتنا بالتقرير والإفادة خلال 24 ساعة.'
];

// Initial Mock Dataset
const INITIAL_PENDING_QUEUE = [];

const INITIAL_ARCHIVE_QUEUE = [];

// Helper to simulate API latency
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for LocalStorage handling
function loadFromStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// Service API layer
export const correspondenceService = {
  /**
   * Fetch pending queue with optional filtering
   * GET /api/resource/Internal External Correspondence?filters=...
   */
  async getPendingQueue(filters = {}) {
    await delay(200);
    let queue = loadFromStorage(STORAGE_KEY_PENDING, INITIAL_PENDING_QUEUE);

    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      queue = queue.filter(
        (item) =>
          item.refNumber.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.sender.toLowerCase().includes(q) ||
          item.senderRepresentative.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'all') {
      queue = queue.filter((item) => item.status === filters.status);
    }

    if (filters.type && filters.type !== 'all') {
      queue = queue.filter((item) => item.type === filters.type);
    }

    if (filters.priority && filters.priority !== 'all') {
      queue = queue.filter((item) => item.priority === filters.priority);
    }

    if (filters.department && filters.department !== 'all') {
      queue = queue.filter((item) => item.targetDepartment === filters.department);
    }

    return queue;
  },

  /**
   * Get single correspondence item by ID
   * GET /api/resource/Internal External Correspondence/{id}
   */
  async getCorrespondenceById(id) {
    await delay(150);
    const pending = loadFromStorage(STORAGE_KEY_PENDING, INITIAL_PENDING_QUEUE);
    const archive = loadFromStorage(STORAGE_KEY_ARCHIVE, INITIAL_ARCHIVE_QUEUE);

    const found = pending.find((item) => item.id === id) || archive.find((item) => item.id === id);
    if (!found) {
      throw new Error(`المراسلة رقم ${id} غير موجودة`);
    }
    return JSON.parse(JSON.stringify(found));
  },

  /**
   * Save canvas annotations for a correspondence
   * PUT/POST /api/method/moraslat.save_annotations
   */
  async saveAnnotations(id, annotationsPayload) {
    await delay(200);
    const pending = loadFromStorage(STORAGE_KEY_PENDING, INITIAL_PENDING_QUEUE);
    const index = pending.findIndex((item) => item.id === id);

    if (index !== -1) {
      pending[index].annotations = annotationsPayload;
      if (pending[index].status === 'pending') {
        pending[index].status = 'annotated';
      }
      saveToStorage(STORAGE_KEY_PENDING, pending);
      return pending[index];
    }
    return null;
  },

  /**
   * Finalize annotations, attach handwritten signature, route to departments, and move to Archive
   * POST /api/method/moraslat.finalize_and_route
   */
  async finalizeAndRoute(id, { signature, referTo = [], note = '' }) {
    await delay(400);
    const pending = loadFromStorage(STORAGE_KEY_PENDING, INITIAL_PENDING_QUEUE);
    const archive = loadFromStorage(STORAGE_KEY_ARCHIVE, INITIAL_ARCHIVE_QUEUE);

    const index = pending.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('المراسلة غير موجودة في طابور المعالجة الحالي');
    }

    const itemToArchive = pending[index];
    itemToArchive.status = 'archived';
    itemToArchive.completedAt = new Date().toISOString();
    itemToArchive.routedTo = Array.isArray(referTo) ? referTo : [referTo];
    itemToArchive.signature = signature;
    itemToArchive.note = note;
    itemToArchive.annotatorName = 'سعادة المدير العام';

    // Remove from pending & add to archive
    pending.splice(index, 1);
    archive.unshift(itemToArchive);

    saveToStorage(STORAGE_KEY_PENDING, pending);
    saveToStorage(STORAGE_KEY_ARCHIVE, archive);

    return {
      success: true,
      archivedItem: itemToArchive,
      remainingCount: pending.length
    };
  },

  /**
   * Fetch archive queue
   * GET /api/resource/Internal External Correspondence?status=archived
   */
  async getArchive(filters = {}) {
    await delay(200);
    let archive = loadFromStorage(STORAGE_KEY_ARCHIVE, INITIAL_ARCHIVE_QUEUE);

    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      archive = archive.filter(
        (item) =>
          item.refNumber.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.sender.toLowerCase().includes(q)
      );
    }

    if (filters.department && filters.department !== 'all') {
      archive = archive.filter((item) => item.routedTo && item.routedTo.includes(filters.department));
    }

    return archive;
  },

  /**
   * Save updated queue order (Drag & drop)
   */
  async saveQueueOrder(orderedQueue) {
    await delay(100);
    saveToStorage(STORAGE_KEY_PENDING, orderedQueue);
    return orderedQueue;
  },

  /**
   * Get department list
   */
  async getDepartmentsList() {
    return DEPARTMENTS;
  },

  /**
   * Add a new correspondence item to the pending queue
   */
  async addCorrespondence(item) {
    await delay(100);
    const pending = loadFromStorage(STORAGE_KEY_PENDING, INITIAL_PENDING_QUEUE);
    pending.unshift(item);
    saveToStorage(STORAGE_KEY_PENDING, pending);
    return pending;
  },

  /**
   * Reset data back to default mock dataset
   */
  async resetToMockData() {
    await delay(250);
    saveToStorage(STORAGE_KEY_PENDING, INITIAL_PENDING_QUEUE);
    saveToStorage(STORAGE_KEY_ARCHIVE, INITIAL_ARCHIVE_QUEUE);
    return { pending: INITIAL_PENDING_QUEUE, archive: INITIAL_ARCHIVE_QUEUE };
  }
};
