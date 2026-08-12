// Native IndexedDB manager for storing PDF files safely without LocalStorage quota limits

const DB_NAME = 'moraslat_pdf_db';
const STORE_NAME = 'pdf_blobs';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export const pdfBlobStore = {
  /**
   * Save Blob, File or DataURL to IndexedDB
   */
  async savePdf(id, blobOrData) {
    if (!id || !blobOrData) return;
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(blobOrData, id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error('IndexedDB savePdf error:', err);
    }
  },

  /**
   * Retrieve Blob, File or DataURL from IndexedDB
   */
  async getPdf(id) {
    if (!id) return null;
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('IndexedDB getPdf error:', err);
      return null;
    }
  },

  /**
   * Delete item from IndexedDB
   */
  async deletePdf(id) {
    if (!id) return;
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
    } catch (err) {
      console.error('IndexedDB deletePdf error:', err);
    }
  }
};
