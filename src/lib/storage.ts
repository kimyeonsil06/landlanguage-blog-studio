import { createDraft } from './draft';
import type { Draft } from '../types';

const DRAFT_KEY = 'landlanguage.current.v1';
const ARCHIVE_KEY = 'landlanguage.archive.v1';

export function loadCurrent(): Draft {
  try {
    const parsed = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    return parsed?.schemaVersion === 1 ? { ...createDraft(), ...parsed } : createDraft();
  } catch { return createDraft(); }
}
export function saveCurrent(draft: Draft): boolean {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() })); return true; } catch { return false; }
}
export function loadArchive(): Draft[] {
  try { const value = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; }
}
export function saveArchive(draft: Draft): boolean {
  try {
    const list = loadArchive(); const next = { ...draft, updatedAt: new Date().toISOString() };
    const index = list.findIndex((item) => item.id === next.id);
    if (index >= 0) list[index] = next; else list.unshift(next);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list)); return true;
  } catch { return false; }
}
export function deleteArchive(id: string) { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(loadArchive().filter((item) => item.id !== id))); }

const DB = 'landlanguage-images'; const STORE = 'blobs';
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
}
export async function putBlob(id: string, blob: Blob) { const db = await openDb(); await new Promise<void>((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(blob, id); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); db.close(); }
export async function getBlob(id: string): Promise<Blob | undefined> { const db = await openDb(); const value = await new Promise<Blob | undefined>((resolve, reject) => { const req = db.transaction(STORE).objectStore(STORE).get(id); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); db.close(); return value; }
export async function deleteBlob(id: string) { const db = await openDb(); await new Promise<void>((resolve) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(id); tx.oncomplete = () => resolve(); }); db.close(); }
