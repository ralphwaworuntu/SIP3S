const CACHE = "sip3s-cache-v1";
const OFFLINE_URLS = ["/", "/index.html", "/manifest.webmanifest"];
const LOCAL_DEV_API = "http://localhost:4000/api";
const API_PREFIX = self.location.origin.includes("localhost:5173") ? LOCAL_DEV_API : `${self.location.origin}/api`;
const DB_NAME = "sip3s";
const DB_VERSION = 1;
const PENDING_STORE = "pendingReports";
const SESSION_STORE = "session";
const SYNC_TAG = "sync-laporan";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE);
          return cache.match("/index.html");
        })
    );
    return;
  }

  if (url.href.startsWith(API_PREFIX)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.match(request);
          if (cache) return cache;
          return new Response(
            JSON.stringify({ message: "Offline" }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            }
          );
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cached);
      return cached ?? fetchPromise;
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncPendingReports());
  }
});

async function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readAllPending(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PENDING_STORE, "readonly");
    const store = transaction.objectStore(PENDING_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
}

async function deletePending(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PENDING_STORE, "readwrite");
    const store = transaction.objectStore(PENDING_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

async function syncPendingReports() {
  const db = await openDb();
  const reports = await readAllPending(db);
  if (!reports.length) return;

  await Promise.all(
    reports.map(async (entry) => {
      try {
        const target = `${API_PREFIX}/reports`;
        const response = await fetch(target, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry.payload ?? entry),
        });
        if (response.ok) {
          await deletePending(db, entry.id);
        }
      } catch (error) {
        console.error("Gagal sinkronisasi", error);
      }
    })
  );
}

self.addEventListener("message", (event) => {
  if (event.data === "force-sync") {
    syncPendingReports().catch((error) => console.error(error));
  }
});
