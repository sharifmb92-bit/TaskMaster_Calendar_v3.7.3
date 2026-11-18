/* TaskMaster Calendar Pro_v 3.7.3 | medbasha */
const CACHE_NAME = 'taskmaster-v3-7-3';
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './badge-72.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                ASSETS.map((asset) => cache.add(asset).catch(() => null))
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => caches.match(event.request))
    );
});

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAelzQOy8KFQ5OZkctKJS2DZUaxvaLMfRE",
    authDomain: "taskmastercalendar-a779e.firebaseapp.com",
    databaseURL: "https://taskmastercalendar-a779e-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "taskmastercalendar-a779e",
    storageBucket: "taskmastercalendar-a779e.firebasestorage.app",
    messagingSenderId: "628005433300",
    appId: "1:628005433300:web:b6a39ed06922a34de07041"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const title = (payload.notification && payload.notification.title) || 'TaskMaster Alerta';
    const options = {
        body: (payload.notification && payload.notification.body) || 'Tienes un recordatorio pendiente.',
        icon: './icon-192.png',
        badge: './badge-72.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        renotify: true,
        tag: (payload.data && payload.data.tag) || 'taskmaster_push'
    };

    return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('index.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./index.html');
            }
        })
    );
});
