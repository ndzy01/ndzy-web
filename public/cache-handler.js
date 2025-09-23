// 缓存版本号
const CACHE_VERSION = 'v6';
const CACHE_NAME = 'ndzy-cache';
// 缓存名称
const CACHE_NAMES = {
  PRECACHE_KEY: `${CACHE_NAME}-${CACHE_VERSION}`,
};

/**
 * CacheManager 类负责管理缓存，包括预缓存资源、处理请求、清理旧缓存等功能。
 */
class CacheManager {
  constructor() {
    /**
     * pendingRequests 用于存储正在进行的请求，防止重复请求。
     */
    this.pendingRequests = new Map();

    /**
     * maxRetries 请求失败时的最大重试次数。
     */
    this.maxRetries = 3;

    /**
     * retryDelay 基础重试延迟，重试时会指数级增加（指数退避）。
     */
    this.retryDelay = 1000;

    /**
     * resourceMap 存储资源的 URL 到资源对象的映射，方便快速查找。
     */
    this.resourceMap = new Map();

    this.initialize();
  }

  /**
   * 初始化资源映射表
   */
  async initialize() {
    const resourceList = await this.getData();
    for (const resource of resourceList) {
      this.resourceMap.set(resource.url, resource);
    }
  }

  /**
   * 获取资源列表
   * @returns {Array<{url: string, revision: string, hash: string}>} 资源列表
   */
  async getData() {
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
  }

  /**
   * 单点控制 - 防重复请求
   * @param {string} key
   * @param {Function} requestFn
   * @returns {Promise}
   */
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

  /**
   * 处理请求
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  async processRequest(request) {
    const url = request.url;
    const requestKey = `${request.method}:${url}`;

    return this.singleFlight(requestKey, async () => {
      return this.handleGenericResource(request);
    });
  }

  /**
   * 处理通用资源请求
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  async handleGenericResource(request) {
    const cache = await caches.open(CACHE_NAMES.PRECACHE_KEY);
    let cachedResponse = await cache.match(request);

    // 如果没命中，尝试用带 revision 的 url 匹配
    if (!cachedResponse) {
      // 查找 revision
      const url = request.url;
      const resource = this.resourceMap.get(url);
      if (resource && resource.revision) {
        const cacheUrl = `${url}${url.includes('?') ? '&' : '?'}rev=${resource.revision}`;
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

  /**
   * 预缓存资源
   * @param {Array<{url: string, revision: string, hash: string}>} resourceList 资源列表
   */
  async precacheResources(resourceList) {
    console.log(`开始串行预缓存 ${resourceList.length} 个资源...`);

    const cache = await caches.open(CACHE_NAMES.PRECACHE_KEY);
    for (let i = 0; i < resourceList.length; i++) {
      const resource = resourceList[i];
      if (resource.url && resource.revision && resource.hash) {
        // 用 revision 拼接到 url 上，作为唯一 key
        const cacheUrl = `${resource.url}${resource.url.includes('?') ? '&' : '?'}rev=${resource.revision}`;
        // 检查是否已缓存
        const cached = await cache.match(new Request(cacheUrl));
        if (cached) {
          console.log(`跳过第 ${i + 1} 个资源（已存在缓存）: ${cacheUrl}`);
          continue;
        }
        try {
          console.log(
            `正在加载第 ${i + 1}/${resourceList.length} 个资源: ${cacheUrl}`,
          );
          const response = await this.retryFetch(cacheUrl);
          if (response.ok) {
            const arrayBuffer = await response.clone().arrayBuffer();
            const hash = await this.calculateHash(arrayBuffer);
            if (hash === resource.hash) {
              await cache.put(new Request(cacheUrl), response);
              console.log(`✅ 第 ${i + 1} 个资源缓存完成（hash校验通过）`);
            } else {
              console.warn(
                `❌ 第 ${i + 1} 个资源 hash 校验失败:`,
                hash,
                '!=',
                resource.hash,
              );
            }
          } else {
            console.warn(
              `❌ 第 ${i + 1} 个资源下载失败，状态码: ${response.status}`,
            );
          }
        } catch (error) {
          console.warn(
            `❌ 第 ${i + 1} 个资源加载失败（重试 ${this.maxRetries} 次后）:`,
            error.message,
          );
        }
      }
    }
    console.log('🎉 所有资源预缓存完成!');
  }

  /**
   * 带重试机制的fetch请求
   * @param {string} url
   * @param {any} options
   * @param {number} retryCount
   * @returns {Promise<Response>}
   */
  async retryFetch(url, options = {}, retryCount = 0) {
    try {
      const response = await fetch(url, options);

      // 如果是4xx状态码，不重试
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // 如果是5xx状态码或网络错误，进行重试
      if (!response.ok && retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        console.warn(`第 ${retryCount + 1} 次重试 ${url}，延迟 ${delay}ms`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryFetch(url, options, retryCount + 1);
      }

      return response;
    } catch (error) {
      // 网络错误，进行重试
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        console.warn(
          `第 ${retryCount + 1} 次重试 ${url}（网络错误），延迟 ${delay}ms`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryFetch(url, options, retryCount + 1);
      }

      // 达到最大重试次数，抛出错误
      throw new Error(
        `请求失败: ${url}，重试 ${this.maxRetries} 次后仍然失败: ${error.message}`,
      );
    }
  }

  /**
   * 计算 ArrayBuffer 的 SHA-256 hash
   * @param {ArrayBuffer} arrayBuffer
   * @returns {Promise<string>}
   */
  async calculateHash(arrayBuffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 清理旧缓存
   */
  async cleanupOldCache() {
    console.log('开始清理缓存key级别旧缓存...');
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
    const latestList = this.getData();
    const latestRevisions = new Set(latestList.map((r) => r.revision));

    let deleted = 0;
    for (const request of cacheKeys) {
      const url = request.url.split('?rev=')[0]; // 去掉 rev 参数
      const revMatch = request.url.match(/[?&]rev=([^&]+)/);
      const rev = revMatch ? revMatch[1] : null;
      const existsInLatest = this.resourceMap.has(url);

      // 删除：1. 没有 rev；2. rev 不是最新；3. url 不在最新列表
      if (!rev || !latestRevisions.has(rev) || !existsInLatest) {
        await cache.delete(request);
        deleted++;
      }
    }

    console.log(`清理了 ${deleted} 个旧版本资源缓存或无效资源.`);
  }
}

// 全局缓存管理器实例
const cacheManager = new CacheManager();

/**
 * 清理缓存
 */
const handleClear = async () => {
  // 资源级别缓存清理
  await cacheManager.cleanupOldCache();
};

// install 阶段预缓存资源
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(handleCache());
});

/**
 * 处理资源预缓存
 */
const handleCache = async () => {
  const res = cacheManager.getData();
  await cacheManager.precacheResources(res);
};

// activate 阶段清理旧缓存并接管页面
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await handleClear();
      await self.clients.claim();
    })(),
  );
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
