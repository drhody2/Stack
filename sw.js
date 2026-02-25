const CACHE="stack-gh-ready-v1";
const ASSETS=["./","./index.html","./styles.css?v=1","./app.js?v=1","./manifest.json","./sw.js","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",(e)=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting();});
self.addEventListener("activate",(e)=>{e.waitUntil((async()=>{const keys=await caches.keys(); await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))); await self.clients.claim();})());});
self.addEventListener("fetch",(e)=>{e.respondWith((async()=>{const cached=await caches.match(e.request); if(cached) return cached; try{ return await fetch(e.request);}catch(_){ return cached || new Response("Offline",{status:200}); }})());});
