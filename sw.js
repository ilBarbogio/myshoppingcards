const CACHE_NAME="mycards_cache"
const CACHE_VERSION="1"

const addResourcesToCache=async (resources)=>{
const cache=await caches.open(`${CACHE_NAME}-v${CACHE_VERSION}`)
await cache.addAll(resources)
}

self.addEventListener("install", (event)=>{
event.waitUntil(
    addResourcesToCache([
        "/index.html",
        "/index.css",
        "/index.js",

        "/libs/barcode.min.js",
        "/libs/qrcode.js",
        "/scripts/menu.js",
        "/scripts/store.js",
        "/scripts/addCard.js",
    ]),
)
})

const putInCache=async (request, response)=>{
const cache=await caches.open(`${CACHE_NAME}-v${CACHE_VERSION}`)
await cache.put(request, response)
}

const cacheFirst=async (request)=>{
const responseFromCache=await caches.match(request)
if (responseFromCache) {
    return responseFromCache
}
const responseFromNetwork=await fetch(request)
putInCache(request, responseFromNetwork.clone())
return responseFromNetwork
}

self.addEventListener("fetch", (event)=>{
event.respondWith(cacheFirst(event.request))
})
  