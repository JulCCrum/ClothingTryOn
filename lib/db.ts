// IndexedDB helper for storing large files
const DB_NAME = 'FitMirrorDB';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

export interface PhotoData {
  angle: string;
  file: File;
  timestamp: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'angle' });
      }
    };
  });
};

export const savePhoto = async (angle: string, file: File): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const data: PhotoData = {
      angle,
      file,
      timestamp: Date.now(),
    };

    const request = store.put(data);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getPhoto = async (angle: string): Promise<File | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(angle);

    request.onsuccess = () => {
      const data = request.result as PhotoData | undefined;
      resolve(data?.file || null);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getAllPhotos = async (): Promise<Record<string, File>> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const photos: Record<string, File> = {};
      const results = request.result as PhotoData[];

      results.forEach((data) => {
        photos[data.angle] = data.file;
      });

      resolve(photos);
    };
    request.onerror = () => reject(request.error);
  });
};

export const clearAllPhotos = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Store results in IndexedDB
const RESULTS_DB_NAME = 'FitMirrorResultsDB';
const RESULTS_STORE_NAME = 'results';
const RESULTS_DB_VERSION = 1;

const openResultsDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(RESULTS_DB_NAME, RESULTS_DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(RESULTS_STORE_NAME)) {
        db.createObjectStore(RESULTS_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveTryonResults = async (results: any): Promise<void> => {
  const db = await openResultsDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(RESULTS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(RESULTS_STORE_NAME);

    const data = {
      id: 'latest',
      results,
      timestamp: Date.now(),
    };

    const request = store.put(data);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getTryonResults = async (): Promise<any | null> => {
  const db = await openResultsDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(RESULTS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(RESULTS_STORE_NAME);
    const request = store.get('latest');

    request.onsuccess = () => {
      const data = request.result;
      resolve(data?.results || null);
    };
    request.onerror = () => reject(request.error);
  });
};
