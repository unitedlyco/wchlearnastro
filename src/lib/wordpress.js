/**
 * WordPress GraphQL client for fetching blog content
 */
import { WordPressCache } from './wordpress-cache.js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Global cache to persist between requests during development
const GLOBAL_CACHE = new Map();

// Determine if we're in build mode - check both NODE_ENV and ASTRO_PRODUCTION
const IS_BUILD = process.env.NODE_ENV === 'production' || 
                process.env.ASTRO_PRODUCTION === 'true' ||
                process.env.ASTRO_MODE === 'build';

export default class WordPressGraphQLClient {
  constructor(endpoint = 'https://www.worldcouncilforhealth.org/graphql', useRedis = false) {
    this.endpoint = endpoint;
    // Use in-memory cache with longer TTL
    this.cache = new WordPressCache(86400000); // 24 hours
    this.maxRetries = 3;
    this.timeout = 10000; // 10 seconds timeout
    this.postsPerPage = 12; // Default posts per page
    this.cacheDir = path.join(process.cwd(), '.cache');
    
    // Skip file caching setup in build mode
    if (IS_BUILD) {
      console.log('Running in build mode - file caching disabled');
      return;
    }
    
    // Create cache directory if it doesn't exist
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
    } catch (error) {
      console.warn('Could not create cache directory:', error);
    }
  }

  getCacheFilePath(key) {
    // Skip in build mode
    if (IS_BUILD) return null;
    
    // Create a hash of the key for the filename
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return path.join(this.cacheDir, `wp_${hash}.json`);
  }

  async getFromFileCache(key) {
    // Skip in build mode
    if (IS_BUILD) return null;
    
    try {
      // First check global cache (for dev server)
      if (GLOBAL_CACHE.has(key)) {
        const item = GLOBAL_CACHE.get(key);
        if (Date.now() < item.expiry) {
          return item.data;
        }
        GLOBAL_CACHE.delete(key);
      }
      
      // Then check file cache
      try {
        const cacheFile = this.getCacheFilePath(key);
        if (cacheFile && fs.existsSync(cacheFile)) {
          const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
          if (Date.now() < cacheData.expiry) {
            // Also update global cache
            GLOBAL_CACHE.set(key, cacheData);
            return cacheData.data;
          }
          // Cache expired, delete the file
          try {
            fs.unlinkSync(cacheFile);
          } catch (unlinkError) {
            console.warn('Error deleting expired cache file:', unlinkError);
            // Continue execution even if deletion fails
          }
        }
      } catch (fileError) {
        console.warn('Error reading from file cache:', fileError);
        // Continue execution - we'll just fetch fresh data
      }
    } catch (error) {
      console.warn('Error in getFromFileCache:', error);
      // Don't throw - allow the application to continue even if caching fails
    }
    
    return null;
  }

  async saveToFileCache(key, data, ttl = 86400000) { // 24 hours default
    // Skip in build mode
    if (IS_BUILD) return;
    
    const cacheData = {
      data,
      expiry: Date.now() + ttl
    };
    
    // Update global cache
    GLOBAL_CACHE.set(key, cacheData);
    
    // Save to file
    try {
      const cacheFile = this.getCacheFilePath(key);
      if (!cacheFile) return;
      
      // Make sure the data can be serialized
      try {
        JSON.stringify(cacheData);
      } catch (serializeError) {
        console.warn('Error serializing cache data:', serializeError);
        return; // Skip file caching if data can't be serialized
      }
      
      // Write to file with error handling
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(cacheData), 'utf8');
      } catch (writeError) {
        // If the error is ENAMETOOLONG, log it but don't throw
        if (writeError.code === 'ENAMETOOLONG') {
          console.warn('Cache filename too long, using in-memory cache only');
        } else {
          console.warn('Error writing to file cache:', writeError);
        }
        // Continue execution - the in-memory cache is still valid
      }
    } catch (error) {
      console.warn('Error in saveToFileCache:', error);
      // Don't throw - allow the application to continue even if caching fails
    }
  }

  async query(query, variables = {}, useCache = true) {
    // Create a cache key from the query and variables
    const cacheKey = JSON.stringify({ query, variables });
    
    // Check cache first if caching is enabled and not in build mode
    if (useCache && !IS_BUILD) {
      // First try file cache
      const cachedData = await this.getFromFileCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Then try memory cache (legacy)
      const memCachedData = await this.cache.get(cacheKey);
      if (memCachedData) {
        return memCachedData;
      }
    }
    
    // Fetch from WordPress GraphQL API
    let retries = 0;
    let result = null;
    
    while (retries < this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; WCH Learn/1.0; +https://learn.worldcouncilforhealth.org)'
          },
          body: JSON.stringify({
            query,
            variables
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`WordPress GraphQL API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.errors) {
          throw new Error(`WordPress GraphQL API returned errors: ${JSON.stringify(data.errors)}`);
        }
        
        result = data.data;
        break; // Success, exit the retry loop
      } catch (error) {
        retries++;
        if (retries >= this.maxRetries) {
          throw new Error(`Failed to fetch from WordPress GraphQL API after ${this.maxRetries} attempts: ${error.message}`);
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      }
    }
    
    // Cache the result if successful and not in build mode
    if (result && !IS_BUILD && useCache) {
      await this.cache.set(cacheKey, result);
      await this.saveToFileCache(cacheKey, result);
    }
    
    return result;
  }

  async getAllPosts(count = 12, after = null) {
    // In build mode, skip the cache check
    if (!IS_BUILD) {
      // Create a specific cache key for getAllPosts
      const allPostsCacheKey = `wp_all_posts_${count}_${after || 'start'}`;
      
      // Check if we have a cached version
      const cachedAllPosts = await this.getFromFileCache(allPostsCacheKey);
      if (cachedAllPosts) {
        return cachedAllPosts;
      }
    }
    
    console.log(`Fetching WordPress posts, count: ${count}, after: ${after || 'start'}`);
    
    const query = `
      query GetAllPosts($first: Int!, $after: String) {
        posts(first: $first, after: $after, where: {status: PUBLISH}) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            title
            date
            excerpt(format: RENDERED)
            slug
            categories {
              nodes {
                name
                slug
              }
            }
            featuredImage {
              node {
                sourceUrl(size: MEDIUM)
                altText
              }
            }
            author {
              node {
                name
              }
            }
          }
        }
      }
    `;
    
    const variables = {
      first: count,
      after: after
    };
    
    try {
      const result = await this.query(query, variables);
      
      // Cache the result if not in build mode
      if (!IS_BUILD) {
        const allPostsCacheKey = `wp_all_posts_${count}_${after || 'start'}`;
        await this.saveToFileCache(allPostsCacheKey, result, 3600000); // 1 hour cache for blog index
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching WordPress posts:', error);
      throw error;
    }
  }

  async getCategoryPosts(categorySlug, count = 12, after = null) {
    // In build mode, skip the cache check
    if (!IS_BUILD) {
      // Create a specific cache key for getCategoryPosts
      const categoryCacheKey = `wp_category_${categorySlug}_${count}_${after || 'start'}`;
      
      // Check if we have a cached version
      const cachedCategoryPosts = await this.getFromFileCache(categoryCacheKey);
      if (cachedCategoryPosts) {
        return cachedCategoryPosts;
      }
    }
    
    console.log(`Fetching WordPress posts for category ${categorySlug}, count: ${count}, after: ${after || 'start'}`);
    
    const query = `
      query GetCategoryPosts($slug: ID!, $first: Int!, $after: String) {
        category(id: $slug, idType: SLUG) {
          id
          name
          slug
          description
          posts(first: $first, after: $after, where: {status: PUBLISH}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              title
              date
              excerpt(format: RENDERED)
              slug
              featuredImage {
                node {
                  sourceUrl(size: MEDIUM)
                  altText
                }
              }
              author {
                node {
                  name
                }
              }
            }
          }
        }
      }
    `;
    
    const variables = {
      slug: categorySlug,
      first: count,
      after: after
    };
    
    try {
      const result = await this.query(query, variables);
      
      // Cache the result if not in build mode
      if (!IS_BUILD) {
        const categoryCacheKey = `wp_category_${categorySlug}_${count}_${after || 'start'}`;
        await this.saveToFileCache(categoryCacheKey, result, 3600000); // 1 hour cache for category pages
      }
      
      return result;
    } catch (error) {
      console.error(`Error fetching posts for category ${categorySlug}:`, error);
      throw error;
    }
  }

  async getPostBySlug(slug) {
    // In build mode, skip the cache check
    if (!IS_BUILD) {
      // Create a specific cache key for the post
      const postCacheKey = `wp_post_${slug}`;
      
      // Check if we have a cached version
      const cachedPost = await this.getFromFileCache(postCacheKey);
      if (cachedPost) {
        return cachedPost;
      }
    }
    
    console.log(`Fetching WordPress post with slug "${slug}"`);
    
    const query = `
      query GetPostBySlug($slug: ID!) {
        post(id: $slug, idType: SLUG) {
          id
          title
          content
          date
          excerpt(format: RENDERED)
          slug
          categories {
            nodes {
              name
              slug
            }
          }
          featuredImage {
            node {
              sourceUrl(size: LARGE)
              altText
            }
          }
          author {
            node {
              name
            }
          }
        }
      }
    `;
    
    const variables = {
      slug: slug
    };
    
    try {
      const result = await this.query(query, variables);
      
      // Cache the result if not in build mode
      if (!IS_BUILD) {
        const postCacheKey = `wp_post_${slug}`;
        await this.saveToFileCache(postCacheKey, result, 3600000); // 1 hour cache for single posts
      }
      
      return result;
    } catch (error) {
      console.error(`Error fetching post with slug "${slug}":`, error);
      // Return a default structure to prevent null reference errors
      return {
        post: {
          id: slug,
          title: 'Error Loading Post',
          content: '<p>There was an error loading this post.</p>',
          date: new Date().toISOString(),
          excerpt: 'There was an error loading this post.',
          slug: slug,
          categories: { nodes: [] },
          featuredImage: null,
          author: { node: { name: 'Unknown' } }
        }
      };
    }
  }

  async getAllCategories() {
    // Create a specific cache key for categories
    const categoriesCacheKey = `wp_all_categories`;
    
    // Check if we have a cached version
    const cachedCategories = await this.getFromFileCache(categoriesCacheKey);
    if (cachedCategories) {
      return cachedCategories;
    }
    
    const query = `
      query GetAllCategories {
        categories {
          nodes {
            id
            name
            slug
            description
          }
        }
      }
    `;

    const result = await this.query(query);
    
    // Cache the result
    if (result && result.categories) {
      await this.saveToFileCache(categoriesCacheKey, result);
    }
    
    return result;
  }
}