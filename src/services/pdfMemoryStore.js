// In-memory synchronous store for uploaded PDF ArrayBuffers / Blobs
const cache = new Map();

export const pdfMemoryStore = {
  setFile(id, data) {
    if (!id || !data) return;
    cache.set(id, data);
  },

  getFile(id) {
    if (!id) return null;
    return cache.get(id) || null;
  },

  hasFile(id) {
    return cache.has(id);
  },

  clear(id) {
    if (id) cache.delete(id);
    else cache.clear();
  }
};
