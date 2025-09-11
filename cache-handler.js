// 缓存版本号
const CACHE_VERSION = 'v3';
const CACHE_NAME = 'ndzy-cache';
// 缓存名称
const CACHE_NAMES = {
  PRECACHE_KEY: `${CACHE_NAME}-${CACHE_VERSION}`,
};

// 获取资源列表并加上 revision 字段（如 data.json 里有 revision 字段）
const getData = () => {
  return [
    {
      url: 'https://www.rose.love/common_resources/font/base.woff2',
      revision: 'v-2025-09-11',
      hash: '649b150a3d276e172fadb0c3e82d41b80ec4dee071603600f8e4521ea35b4d16', // 示例 hash
    },
  ].map((d) => ({
    url: d.url,
    revision: d.revision,
    hash: d.hash,
  }));
};

// 简化的缓存管理器
class CacheManager {
  constructor() {
    this.pendingRequests = new Map(); // 防重复请求
  }

  // 单点控制 - 防重复请求
  async singleFlight(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // 处理请求 - 简化版本
  async processRequest(request) {
    const url = request.url;
    const requestKey = `${request.method}:${url}`;

    return this.singleFlight(requestKey, async () => {
      return this.handleGenericResource(request);
    });
  }

  // 通用资源处理
  async handleGenericResource(request) {
    const cache = await caches.open(CACHE_NAMES.PRECACHE_KEY);
    let cachedResponse = await cache.match(request);

    // 如果没命中，尝试用带 revision 的 url 匹配
    if (!cachedResponse) {
      // 查找 revision
      const url = request.url;
      const giftList = getData();
      const gift = giftList.find((g) => g.url === url);
      if (gift && gift.revision) {
        const cacheUrl = `${url}${url.includes('?') ? '&' : '?'}rev=${gift.revision}`;
        cachedResponse = await cache.match(
          new Request(cacheUrl, { method: request.method }),
        );
      }
    }

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    return networkResponse;
  }

  // 预缓存礼物资源 - 串行版本 (一个完成再加载下一个)
  async precacheGiftResources(giftList) {
    console.log(`开始串行预缓存 ${giftList.length} 个资源...`);

    const cache = await caches.open(CACHE_NAMES.PRECACHE_KEY);
    for (let i = 0; i < giftList.length; i++) {
      const gift = giftList[i];
      if (gift.url && gift.revision && gift.hash) {
        // 用 revision 拼接到 url 上，作为唯一 key
        const cacheUrl = `${gift.url}${gift.url.includes('?') ? '&' : '?'}rev=${gift.revision}`;
        // 检查是否已缓存
        const cached = await cache.match(new Request(cacheUrl));
        if (cached) {
          console.log(`跳过第 ${i + 1} 个资源（已存在缓存）: ${cacheUrl}`);
          continue;
        }
        try {
          console.log(
            `正在加载第 ${i + 1}/${giftList.length} 个资源: ${cacheUrl}`,
          );
          const response = await fetch(cacheUrl);
          if (response.ok) {
            const arrayBuffer = await response.clone().arrayBuffer();
            const hash = await this.calculateHash(arrayBuffer);
            if (hash === gift.hash) {
              await cache.put(new Request(cacheUrl), response);
              console.log(`✅ 第 ${i + 1} 个资源缓存完成（hash校验通过）`);
            } else {
              console.warn(
                `❌ 第 ${i + 1} 个资源 hash 校验失败:`,
                hash,
                '!=',
                gift.hash,
              );
            }
          } else {
            console.warn(`❌ 第 ${i + 1} 个资源下载失败`);
          }
        } catch (error) {
          console.warn(`❌ 第 ${i + 1} 个资源加载失败:`, error);
        }
      }
    }
    console.log('🎉 所有资源预缓存完成!');
  }

  // 计算 ArrayBuffer 的 SHA-256 hash，返回 hex 字符串
  async calculateHash(arrayBuffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 清理旧缓存
   */
  async cleanupOldCache() {
    console.log('开始清理旧缓存...');
    // 只保留 CACHE_NAMES.PRECACHE_KEY 版本的缓存 旧的版本删除
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((name) => {
        if (name.includes(CACHE_NAME) && name !== CACHE_NAMES.PRECACHE_KEY) {
          console.log(`删除旧缓存: ${name}`);
          return caches.delete(name);
        }
        return Promise.resolve();
      }),
    );

    // 资源级别缓存清理
    console.log('开始清理资源级别缓存...');
    const cache = await caches.open(CACHE_NAMES.PRECACHE_KEY);
    const cacheKeys = await cache.keys();

    // 获取最新 revision 列表
    const latestList = getData();
    const latestRevisions = new Set(latestList.map((g) => g.revision));

    // 删除不是最新 revision 的资源
    let deleted = 0;
    for (const request of cacheKeys) {
      const url = request.url;
      const revMatch = url.match(/[?&]rev=([^&]+)/);
      const rev = revMatch ? revMatch[1] : null;
      if (!rev || !latestRevisions.has(rev)) {
        await cache.delete(request);
        deleted++;
      }
    }

    // 删除不存在于最新列表的资源
    for (const request of cacheKeys) {
      const url = request.url.split('?rev=')[0]; // 去掉 rev 参数
      const existsInLatest = latestList.some((g) => g.url === url);
      if (!existsInLatest) {
        await cache.delete(request);
        deleted++;
      }
    }

    console.log(`清理了 ${deleted} 个旧版本资源缓存或无效资源.`);
  }
}

// 全局缓存管理器实例
const cacheManager = new CacheManager();

const handleClear = async () => {
  // 资源级别缓存清理
  await cacheManager.cleanupOldCache();
};

// Service Worker 事件监听
// install 阶段只做清理缓存
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(handleClear());
});

const handleCache = async () => {
  const res = getData();
  await cacheManager.precacheGiftResources(res);
  await self.clients.claim();
};

// activate 阶段只做预缓存资源
self.addEventListener('activate', (_event) => {
  handleCache();
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // 只处理特定域名的资源
  if (url.includes('https://www.rose.love/common_resources/font')) {
    event.respondWith(cacheManager.processRequest(request));
  }
});

// 监听页面发过来的事件 进行资源预缓存
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRECACHE_RESOURCES') {
    handleCache();
  }
});
