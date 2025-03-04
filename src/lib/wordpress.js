/**
 * WordPress GraphQL client for fetching blog content
 */
import { WordPressCache } from './wordpress-cache.js';
// Conditionally import Redis if needed
// import { RedisCache } from './redis-cache.js';

export default class WordPressGraphQLClient {
  constructor(endpoint = 'https://www.worldcouncilforhealth.org/graphql', useRedis = false) {
    this.endpoint = endpoint;
    // Use in-memory cache by default, Redis optionally
    this.cache = useRedis ? new RedisCache() : new WordPressCache();
    this.maxRetries = 3;
    this.timeout = 10000; // 10 seconds timeout
  }

  async query(query, variables = {}, useCache = true) {
    // Create a cache key from the query and variables
    const cacheKey = JSON.stringify({ query, variables });
    
    // Check cache first if caching is enabled
    if (useCache) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    let retries = 0;
    let lastError;

    while (retries < this.maxRetries) {
      try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables,
          }),
          signal: controller.signal,
        });

        // Clear the timeout
        clearTimeout(timeoutId);

        // Check if the response is ok
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        
        // Store in cache if caching is enabled
        if (useCache) {
          this.cache.set(cacheKey, result.data);
        }

        return result.data;
      } catch (error) {
        lastError = error;
        console.error(`GraphQL query error (attempt ${retries + 1}/${this.maxRetries}):`, error);
        
        // If it's a timeout or network error, retry
        if (error.name === 'AbortError' || 
            error.code === 'ECONNRESET' || 
            error.message.includes('fetch failed')) {
          retries++;
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
          continue;
        }
        
        // For other errors, don't retry
        throw error;
      }
    }

    // If we've exhausted all retries
    console.error('GraphQL query failed after maximum retries');
    throw lastError;
  }

  async getAllPosts(count = 12, after = null) {
    const query = `
      query GetAllPosts($first: Int!, $after: String) {
        posts(first: $first, after: $after) {
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

    return this.query(query, variables);
  }

  async getCategoryPosts(categorySlug, count = 12, after = null) {
    const query = `
      query GetCategoryPosts($slug: ID!, $first: Int!, $after: String) {
        category(id: $slug, idType: SLUG) {
          name
          description
          posts(first: $first, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              title
              date
              excerpt
              slug
              featuredImage {
                node {
                  sourceUrl
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

    return this.query(query, variables);
  }

  async getPostBySlug(slug) {
    const query = `
      query GetPost($slug: ID!) {
        post(id: $slug, idType: SLUG) {
          id
          title
          date
          content
          excerpt
          slug
          categories {
            nodes {
              name
              slug
            }
          }
          tags {
            nodes {
              name
              slug
            }
          }
          featuredImage {
            node {
              sourceUrl
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

    return this.query(query, variables);
  }

  async getAllCategories() {
    const query = `
      query GetCategories {
        categories(first: 100) {
          nodes {
            id
            name
            slug
            description
          }
        }
      }
    `;

    return this.query(query);
  }
} 