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
    
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

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
      console.error('GraphQL query error:', error);
      throw error;
    }
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