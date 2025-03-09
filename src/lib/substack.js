/**
 * Substack RSS client for fetching Substack content
 * Optimized for static site generation
 */

// Constants
const SUBSTACK_CONFIG = {
  baseUrl: 'https://worldcouncilforhealth.substack.com',
  postsPerPage: 12,
  timeout: 30000, // 30 seconds
  cacheTime: 3600000 // 1 hour
};

class SubstackRSSClient {
  constructor(feedUrl = `${SUBSTACK_CONFIG.baseUrl}/feed`) {
    this.feedUrl = feedUrl;
    this.timeout = SUBSTACK_CONFIG.timeout;
    this.posts = null; // Cache posts in memory during build
    this.lastFetch = 0;
  }

  /**
   * Fetch and parse the RSS feed with caching
   */
  async fetchFeed() {
    try {
      // Check cache first
      if (this.posts && (Date.now() - this.lastFetch) < SUBSTACK_CONFIG.cacheTime) {
        console.log('Using cached Substack posts');
        return this.posts;
      }

      console.log(`Fetching Substack feed from ${this.feedUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(this.feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WCH Learn/1.0; +https://learn.worldcouncilforhealth.org)'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Substack feed: ${response.status} ${response.statusText}`);
      }
      
      const xmlText = await response.text();
      console.log(`Successfully fetched XML, length: ${xmlText.length} characters`);
      
      const posts = this.parseXML(xmlText);
      
      // Update cache
      this.posts = posts;
      this.lastFetch = Date.now();
      
      return posts;
    } catch (error) {
      console.error('Error fetching Substack feed:', error);
      throw error;
    }
  }

  /**
   * Parse XML feed into structured data with improved content extraction
   */
  parseXML(xml) {
    // Helper function to extract CDATA content
    const extractCDATA = (text) => {
      const cdataMatch = text.match(/<!\[CDATA\[(.*?)\]\]>/s);
      return cdataMatch ? cdataMatch[1] : text;
    };

    // Helper function to get tag content
    const getTagContent = (xml, tag) => {
      const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 's');
      const match = xml.match(regex);
      return match ? extractCDATA(match[1].trim()) : '';
    };

    // Helper function to clean HTML content
    const cleanHtml = (html) => {
      return html
        .replace(/\n/g, '') // Remove newlines
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
        .trim();
    };

    // Extract items
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let itemMatch;
    
    while ((itemMatch = itemRegex.exec(xml)) !== null) {
      const itemContent = itemMatch[1];
      
      // Extract content:encoded (may contain HTML)
      const contentEncoded = cleanHtml(getTagContent(itemContent, 'content:encoded'));
      
      // Extract featured image with improved patterns
      let featuredImage = '';
      
      // Try different patterns to find the featured image
      const imgPatterns = [
        // OpenGraph image meta tag
        /<meta\s+property="og:image"\s+content="([^"]+)"/i,
        // Leading image pattern (most likely to be featured image)
        /^\s*(?:<(?:figure|p|div)[^>]*>)?\s*<img[^>]+src="([^"]+)"/i,
        // Figure with image pattern (common in Substack)
        /<figure[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
        // Any image tag
        /<img[^>]+src="([^"]+)"/i
      ];
      
      for (const pattern of imgPatterns) {
        const match = contentEncoded.match(pattern);
        if (match && match[1]) {
          featuredImage = match[1];
          // Ensure image URL is absolute
          if (!featuredImage.startsWith('http')) {
            featuredImage = featuredImage.startsWith('/') 
              ? `${SUBSTACK_CONFIG.baseUrl}${featuredImage}`
              : `${SUBSTACK_CONFIG.baseUrl}/${featuredImage}`;
          }
          break;
        }
      }

      // Extract description (use excerpt if available)
      let description = getTagContent(itemContent, 'description');
      if (description) {
        // Clean up description HTML and limit length
        description = description
          .replace(/<[^>]+>/g, '') // Remove HTML tags
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim()
          .slice(0, 200) + '...'; // Limit length
      }
      
      // Create post object with improved metadata
      items.push({
        title: getTagContent(itemContent, 'title'),
        link: getTagContent(itemContent, 'link'),
        pubDate: new Date(getTagContent(itemContent, 'pubDate')),
        description,
        content: contentEncoded,
        featuredImage,
        author: getTagContent(itemContent, 'dc:creator') || getTagContent(itemContent, 'creator') || 'WCH Team',
        guid: getTagContent(itemContent, 'guid'),
        categories: Array.from(itemContent.matchAll(/<category>([^<]+)<\/category>/g)).map(m => m[1])
      });
    }
    
    return items;
  }

  /**
   * Get all posts
   */
  async getAllPosts() {
    try {
      const posts = await this.fetchFeed();
      return posts.sort((a, b) => b.pubDate - a.pubDate);
    } catch (error) {
      console.error('Error getting all posts:', error);
      return [];
    }
  }

  /**
   * Get paginated posts with improved pagination
   */
  async getPaginatedPosts(page = 1) {
    try {
      const posts = await this.getAllPosts();
      const startIndex = (page - 1) * SUBSTACK_CONFIG.postsPerPage;
      const endIndex = startIndex + SUBSTACK_CONFIG.postsPerPage;
      
      return {
        posts: posts.slice(startIndex, endIndex),
        pagination: {
          totalPages: Math.ceil(posts.length / SUBSTACK_CONFIG.postsPerPage),
          currentPage: page,
          hasNextPage: endIndex < posts.length,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error getting paginated posts:', error);
      return {
        posts: [],
        pagination: {
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
  }

  /**
   * Get a specific post by slug with improved error handling
   */
  async getPostBySlug(slug) {
    try {
      // Handle array of slugs from [...slug] routing
      const targetSlug = Array.isArray(slug) ? slug[0] : slug;
      
      const posts = await this.getAllPosts();
      return posts.find(post => {
        // Extract slug from the full URL path
        const urlParts = post.link.split('/');
        const postSlug = urlParts[urlParts.length - 1];
        
        console.log(`Comparing slugs - Target: "${targetSlug}", Post: "${postSlug}"`);
        
        return postSlug === targetSlug;
      });
    } catch (error) {
      console.error(`Error getting post by slug "${slug}":`, error);
      return null;
    }
  }
}

export default new SubstackRSSClient(); 