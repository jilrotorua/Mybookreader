importScripts('./jszip.min.js');
const CACHE='digital-library-phone-v3';
const FILES=["./", "./pdf.min.mjs", "./pdf-resources.zip", "./pdf.worker.min.mjs", "./pdf-lib.min.js", "./jszip.min.js", "./icon.png", "./style.css", "./manifest.json", "./app.mjs", "./index.html"];
let resources;
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(FILES);await self.skipWaiting()})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('digital-library-')&&k!==CACHE)await caches.delete(k);await self.clients.claim()})()));
async function resourceArchive(){if(!resources)resources=(async()=>{const c=await caches.open(CACHE);const response=await c.match(new URL('./pdf-resources.zip',self.registration.scope));if(!response)throw Error('PDF resources missing');return JSZip.loadAsync(await response.arrayBuffer())})();return resources}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
const prefix=new URL('./vendor/',self.registration.scope).href;
if(e.request.url.startsWith(prefix)){e.respondWith((async()=>{const name=e.request.url.slice(prefix.length);const z=await resourceArchive();const f=z.file(name);if(!f)return new Response('Not found',{status:404});return new Response(await f.async('uint8array'),{headers:{'Content-Type':'application/octet-stream'}})})());return}
e.respondWith((async()=>{const c=await caches.open(CACHE);const cached=await c.match(e.request);if(cached)return cached;try{return await fetch(e.request)}catch(err){if(e.request.mode==='navigate')return c.match('./index.html');throw err}})())});
