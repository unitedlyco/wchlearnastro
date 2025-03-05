/**
 * Substack RSS client for fetching Substack content
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

export default class SubstackRSSClient {
  constructor(feedUrl = 'https://worldcouncilforhealth.substack.com/feed', useRedis = false) {
    this.feedUrl = feedUrl;
    this.cache = new WordPressCache(86400000); // Increase cache TTL to 24 hours
    this.maxRetries = 3;
    this.timeout = 10000; // 10 seconds timeout
    this.postsPerPage = 12; // Match blog pagination
    this.cacheDir = path.join(process.cwd(), '.cache');
    
    // Skip file caching setup in build mode
    if (IS_BUILD) {
      console.log('Running in build mode - file caching disabled for Substack');
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
    
    // Use a more compact hash to avoid potential ENAMETOOLONG errors
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return path.join(this.cacheDir, `substack_${hash}.json`);
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

  async fetchFeed(useCache = true, page = 1) {
    // Create a cache key
    const cacheKey = `substack_feed_${this.feedUrl.replace(/[^a-zA-Z0-9]/g, '_')}_page_${page}`;
    
    console.log(`fetchFeed called for page ${page}, useCache: ${useCache}, IS_BUILD: ${IS_BUILD}`);
    
    // Check cache first if enabled and not in build mode
    if (useCache && !IS_BUILD) {
      // First try file cache
      const cachedData = await this.getFromFileCache(cacheKey);
      if (cachedData) {
        console.log(`Using cached Substack feed for page ${page}`);
        return cachedData;
      }
      
      // Then try memory cache (legacy)
      const memCachedData = await this.cache.get(cacheKey);
      if (memCachedData) {
        console.log(`Using memory cached Substack feed for page ${page}`);
        return memCachedData;
      }
    }
    
    console.log(`Fetching Substack feed for page ${page} (cache ${useCache ? 'enabled' : 'disabled'})`);
    
    // Fetch the feed
    let retries = 0;
    let xmlText = '';
    
    while (retries < this.maxRetries) {
      try {
        // Add page parameter to URL if page > 1
        const feedUrl = page > 1 ? `${this.feedUrl}?page=${page}` : this.feedUrl;
        
        console.log(`Making fetch request to ${feedUrl}`);
        
        const response = await fetch(feedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WCH Learn/1.0; +https://learn.worldcouncilforhealth.org)'
          },
          timeout: this.timeout,
          // Add cache control headers to prevent browser caching
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch Substack feed: ${response.status} ${response.statusText}`);
        }
        
        xmlText = await response.text();
        console.log(`Successfully fetched XML from ${feedUrl}, length: ${xmlText.length} characters`);
        break; // Success, exit the retry loop
      } catch (error) {
        retries++;
        console.log(`Fetch attempt ${retries} failed: ${error.message}`);
        if (retries >= this.maxRetries) {
          throw new Error(`Failed to fetch Substack feed after ${this.maxRetries} attempts: ${error.message}`);
        }
        // Wait before retrying (exponential backoff)
        const backoffTime = 1000 * Math.pow(2, retries);
        console.log(`Waiting ${backoffTime}ms before retry ${retries+1}`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
    
    // Simple XML parsing function for RSS feeds
    const parseXML = (xml) => {
      // Helper function to extract content between tags
      const getTagContent = (xml, tag) => {
        const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'is');
        const match = xml.match(regex);
        return match ? match[1].trim() : '';
      };
      
      // Helper function to extract CDATA content
      const extractCDATA = (content) => {
        if (content.includes('<![CDATA[')) {
          return content.replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1');
        }
        return content;
      };
      
      // Extract channel info
      const channelContent = getTagContent(xml, 'channel');
      const title = extractCDATA(getTagContent(channelContent, 'title'));
      const description = extractCDATA(getTagContent(channelContent, 'description'));
      const link = getTagContent(channelContent, 'link');
      
      // Extract items
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const items = [];
      let itemMatch;
      
      while ((itemMatch = itemRegex.exec(xml)) !== null) {
        const itemContent = itemMatch[1];
        
        // Extract content:encoded (may contain HTML)
        let contentEncoded = '';
        const contentMatch = itemContent.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
        if (contentMatch) {
          contentEncoded = extractCDATA(contentMatch[1]);
        }
        
        // Extract featured image from content if available
        let featuredImage = '';
        const imgMatch = contentEncoded.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch && imgMatch[1]) {
          featuredImage = imgMatch[1];
        }
        
        // Extract categories
        const categoryRegex = /<category>([\s\S]*?)<\/category>/g;
        const categories = [];
        let categoryMatch;
        
        while ((categoryMatch = categoryRegex.exec(itemContent)) !== null) {
          categories.push(extractCDATA(categoryMatch[1]));
        }
        
        // Create item object
        items.push({
          id: getTagContent(itemContent, 'guid'),
          title: extractCDATA(getTagContent(itemContent, 'title')),
          link: getTagContent(itemContent, 'link'),
          pubDate: getTagContent(itemContent, 'pubDate'),
          description: extractCDATA(getTagContent(itemContent, 'description')),
          content: contentEncoded,
          featuredImage: featuredImage,
          author: extractCDATA(getTagContent(itemContent, 'dc:creator') || getTagContent(itemContent, 'creator') || 'WCH Team'),
          categories: categories
        });
      }
      
      // Determine if there's a next page
      // This is a heuristic - if we got a full page of items, assume there might be more
      const hasNextPage = items.length >= 10; // Typical RSS feed page size
      
      return {
        title,
        description,
        link,
        posts: items, // Return items as posts to match the expected property name
        hasNextPage
      };
    };
    
    const result = parseXML(xmlText);
    
    // Cache the result if successful and not in build mode
    if (result && result.posts && result.posts.length > 0 && !IS_BUILD) {
      // Save to both caches
      await this.cache.set(cacheKey, result);
      await this.saveToFileCache(cacheKey, result);
    }
    
    return result;
  }

  async getAllPosts(count = 100, displayPage = 1, excludeContent = true) {
    // Create a cache key that includes the excludeContent parameter
    const cacheKey = `substack_all_posts_${count}_${displayPage}_${excludeContent}`;
    
    // For static site generation, we should always fetch fresh data
    // Only use cache during development
    const useCache = !IS_BUILD;
    
    console.log(`getAllPosts called for page ${displayPage} with count ${count}, excludeContent: ${excludeContent}, useCache: ${useCache}, IS_BUILD: ${IS_BUILD}`);
    
    // Check cache first if not in build mode and caching is enabled
    if (useCache) {
      const cachedData = await this.getFromFileCache(cacheKey);
      if (cachedData) {
        console.log(`Using cached Substack posts for page ${displayPage}`);
        return cachedData;
      }
    }
    
    console.log(`Fetching Substack posts, page: ${displayPage}, count: ${count}, excludeContent: ${excludeContent}`);
    
    try {
      // Calculate how many pages we need to fetch from the RSS feed
      // Each RSS page typically has 10-20 items
      const itemsPerRSSPage = 20; // Approximate
      const maxPages = Math.ceil(count / itemsPerRSSPage);
      
      console.log(`Will fetch up to ${maxPages} RSS pages to get ${count} items`);
      
      // Fetch the first page
      const firstPageData = await this.fetchFeed(useCache, 1);
      let allItems = [...firstPageData.posts];
      let currentPage = 1;
      
      console.log(`Fetched first RSS page with ${firstPageData.posts.length} items`);
      
      // Fetch additional pages if needed
      while (allItems.length < count && currentPage < maxPages && firstPageData.posts.length > 0) {
        currentPage++;
        // Use useCache parameter to control caching behavior
        console.log(`Fetching RSS page ${currentPage}...`);
        const nextPageData = await this.fetchFeed(useCache, currentPage);
        if (nextPageData.posts.length === 0) {
          console.log(`RSS page ${currentPage} returned 0 items, stopping pagination`);
          break; // No more items
        }
        console.log(`Fetched RSS page ${currentPage} with ${nextPageData.posts.length} items`);
        allItems = [...allItems, ...nextPageData.posts];
      }
      
      console.log(`Total items fetched from RSS: ${allItems.length}`);
      
      // Limit to requested count
      allItems = allItems.slice(0, count);
      
      // Calculate pagination for display
      const postsPerPage = this.postsPerPage;
      const totalItems = allItems.length;
      const totalPages = Math.ceil(totalItems / postsPerPage);
      
      console.log(`Pagination calculation: ${totalItems} total items, ${postsPerPage} per page = ${totalPages} total pages`);
      
      // Get the items for the requested display page
      const startIndex = (displayPage - 1) * postsPerPage;
      const endIndex = Math.min(startIndex + postsPerPage, totalItems);
      const pageItems = allItems.slice(startIndex, endIndex);
      
      console.log(`Returning items ${startIndex+1}-${endIndex} for display page ${displayPage}`);
      
      // If excludeContent is true, remove the content field to save memory
      const processedItems = excludeContent ? 
        pageItems.map(item => {
          // Extract image URLs before removing content
          // First, prioritize the featuredImage that was extracted during XML parsing
          let imageUrl = item.featuredImage || null;
          
          // If no featuredImage, try to find an image in the content
          if (!imageUrl && item.content) {
            // Try multiple regex patterns to find images in the content
            const imgPatterns = [
              // Leading image pattern (most likely to be featured image)
              /^\s*(?:<(?:figure|p|div)[^>]*>)?\s*<img[^>]+src="([^"]+)"/i,
              
              // Figure with image pattern (common in Substack)
              /<figure[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
              
              // Any image tag
              /<img[^>]+src="([^"]+)"/i,
              
              // Background image in style attribute
              /background-image:\s*url\(['"]?([^'"]+)['"]?\)/i,
              
              // Image with escaped quotes (sometimes happens in RSS feeds)
              /src=\\?"([^\\"\s]+\.(?:jpg|jpeg|png|gif|webp))\\?"/i,
              
              // Image with single quotes
              /<img[^>]+src='([^']+)'/i,
              
              // Substack specific image format
              /<div[^>]*class="[^"]*image-link[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i
            ];
            
            // Try each pattern until we find an image
            for (const pattern of imgPatterns) {
              const match = item.content.match(pattern);
              if (match && match[1]) {
                imageUrl = match[1];
                console.log(`Found image using pattern ${pattern} for "${item.title}": ${imageUrl}`);
                break;
              }
            }
            
            if (!imageUrl) {
              console.log(`No image found in content for "${item.title}"`);
            }
          } 
          
          // If still no image, try to find one in the contentSnippet
          if (!imageUrl && item.contentSnippet) {
            const snippetPatterns = [
              /<img[^>]+src="([^"]+)"/i,
              /src=\\?"([^\\"\s]+\.(?:jpg|jpeg|png|gif|webp))\\?"/i,
              /background-image:\s*url\(['"]?([^'"]+)['"]?\)/i,
              /<img[^>]+src='([^']+)'/i
            ];
            
            // Try each pattern until we find an image
            for (const pattern of snippetPatterns) {
              const match = item.contentSnippet.match(pattern);
              if (match && match[1]) {
                imageUrl = match[1];
                console.log(`Found snippet image for "${item.title}": ${imageUrl}`);
                break;
              }
            }
            
            if (!imageUrl) {
              console.log(`No image found in snippet for "${item.title}"`);
            }
          }
          
          // Ensure the image URL is properly formatted
          if (imageUrl && !imageUrl.startsWith('http')) {
            // Handle relative URLs
            if (imageUrl.startsWith('/')) {
              imageUrl = `https://worldcouncilforhealth.substack.com${imageUrl}`;
            } else {
              imageUrl = `https://worldcouncilforhealth.substack.com/${imageUrl}`;
            }
            console.log(`Formatted image URL for "${item.title}": ${imageUrl}`);
          }
          
          console.log(`Final image for "${item.title}": ${imageUrl}`);
          
          // Create a copy without the content field
          const { content, ...rest } = item;
          // Keep a snippet of content for excerpt purposes if needed
          return {
            ...rest,
            contentSnippet: item.contentSnippet || '',
            extractedImage: imageUrl // Add the extracted image URL
          };
        }) : 
        pageItems;
      
      const result = {
        posts: processedItems,
        pageInfo: {
          totalItems,
          totalPages,
          currentPage: displayPage,
          hasNextPage: displayPage < totalPages,
          hasPreviousPage: displayPage > 1
        }
      };
      
      // Cache the result if caching is enabled (not in build mode)
      if (useCache) {
        await this.saveToFileCache(cacheKey, result, 3600000); // 1 hour cache
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching Substack posts:', error);
      throw error;
    }
  }

  async getPostBySlug(slug) {
    // Create a cache key for the post
    const postCacheKey = `substack_post_${slug}`;
    
    // Check cache first if not in build mode
    if (!IS_BUILD) {
      const cachedPost = await this.getFromFileCache(postCacheKey);
      if (cachedPost) {
        return cachedPost;
      }
    }
    
    console.log(`Fetching Substack post with slug "${slug}"`);
    
    try {
      // Fetch all posts with full content (set excludeContent to false)
      const { posts } = await this.getAllPosts(100, 1, false);
      
      // Find the post with the matching slug
      const post = posts.find(post => {
        const url = new URL(post.link);
        const pathParts = url.pathname.split('/');
        const postSlug = pathParts[pathParts.length - 1];
        return postSlug === slug;
      });
      
      if (!post) {
        throw new Error(`Post with slug "${slug}" not found`);
      }
      
      // Cache the result if not in build mode
      if (!IS_BUILD) {
        await this.saveToFileCache(postCacheKey, post, 3600000); // 1 hour cache
      }
      
      return post;
    } catch (error) {
      console.error(`Error fetching Substack post with slug "${slug}":`, error);
      throw error;
    }
  }
} 