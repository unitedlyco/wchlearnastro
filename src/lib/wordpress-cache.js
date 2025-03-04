/**
 * Simple cache implementation for WordPress GraphQL requests
 */
export class WordPressCache {
  constructor(ttl = 3600000) { // Default TTL: 1 hour in milliseconds
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if the cached item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { data, expiry });
  }

  invalidate(key) {
    this.cache.delete(key);
  }

  invalidateAll() {
    this.cache.clear();
  }
} 