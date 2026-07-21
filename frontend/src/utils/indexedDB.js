/**
 * IndexedDB Helper for Client-Side Zero-Latency Audio Recording Storage & Playback
 * Store Blobs locally in browser IndexedDB while uploading a copy to the server.
 */

const DB_NAME = 'InterVueRecordingsDB';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

/**
 * Initialize IndexedDB Object Store
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => {
      resolve(e.target.result);
    };

    request.onerror = (e) => {
      console.error('IndexedDB init error:', e.target.error);
      reject(e.target.error);
    };
  });
};

/**
 * Save Audio Blob locally in browser IndexedDB
 * @param {string} interviewId 
 * @param {number} questionIdx 
 * @param {Blob} audioBlob 
 */
export const saveAudioLocal = async (interviewId, questionIdx, audioBlob) => {
  if (!audioBlob) return;
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const recordKey = `${interviewId}_${questionIdx}`;
    const data = {
      id: recordKey,
      interviewId,
      questionIdx,
      blob: audioBlob,
      timestamp: Date.now()
    };

    store.put(data);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(recordKey);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to server-only:', err);
  }
};

/**
 * Get local Audio Blob Object URL for instant zero-latency playback
 * @param {string} interviewId 
 * @param {number} questionIdx 
 * @returns {Promise<string|null>} Blob URL or null
 */
export const getAudioLocal = async (interviewId, questionIdx) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const recordKey = `${interviewId}_${questionIdx}`;

    const request = store.get(recordKey);
    return new Promise((resolve) => {
      request.onsuccess = () => {
        if (request.result && request.result.blob) {
          const blobUrl = URL.createObjectURL(request.result.blob);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('IndexedDB fetch error:', err);
    return null;
  }
};

/**
 * Delete old recordings for a specific interview
 */
export const clearInterviewAudioLocal = async (interviewId) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.openCursor();

    index.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (cursor.value.interviewId === interviewId) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  } catch (err) {
    console.warn('IndexedDB cleanup error:', err);
  }
};
