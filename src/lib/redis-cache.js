import { createClient } from 'redis';

export class RedisCache {
  constructor(options = {}) {
    this.client = createClient(options);
    this.client.connect();
    this.ttl = options.ttl || 3600; // Default TTL: 1 hour
  }

  async get(key) {
    const data = await this.client.get(`wp_graphql:${key}`);
    return data ? JSON.parse(data) : null;
  }

  async set(key, data) {
    await this.client.set(
      `wp_graphql:${key}`, 
      JSON.stringify(data), 
      { EX: this.ttl }
    );
  }

  async invalidate(key) {
    await this.client.del(`wp_graphql:${key}`);
  }

  async invalidateAll() {
    const keys = await this.client.keys('wp_graphql:*');
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
} 