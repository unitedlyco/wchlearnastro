/**
 * A simple GraphQL client for WordPress
 */
export default class WordPressGraphQLClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async query(query, variables = {}) {
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

      return result.data;
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  }

  async getCategoryPosts(categorySlug, count = 12) {
    const query = `
      query GetCategoryPosts($slug: ID!, $first: Int!) {
        category(id: $slug, idType: SLUG) {
          name
          description
          posts(first: $first) {
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
      first: count
    };

    return this.query(query, variables);
  }
} 