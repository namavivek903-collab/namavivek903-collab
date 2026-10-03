// HuntFloor service worker — installable app, network-first shell, Web Push
const V='hf-v3';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(!/\.(png|webp|jpg|svg|css|js|woff2?)$/.test(u.pathname)&&u.pathname!=='/'&&u.pathname!=='/index.html')return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request)));
});
// ---- push ----
self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{};}catch(_){d={title:'HuntFloor',body:e.data?e.data.text():''};}
  const title=d.title||'HuntFloor';
  e.waitUntil(self.registration.showNotification(title,{body:d.body||'',icon:'/assets/icon-192.png',badge:'/assets/icon-192.png',tag:d.tag||'hf',renotify:true,data:{url:d.url||'/'},vibrate:[80,40,80]}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();const url=new URL(e.notification.data&&e.notification.data.url||'/',self.location.origin).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if(c.url.startsWith(self.location.origin)){c.navigate(url);return c.focus();}}return self.clients.openWindow(url);}));
});
