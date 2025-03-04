import { useState, useEffect } from 'react';
import WordPressGraphQLClient from './graphql-client';

function CategoryTemplate({ categorySlug }) {
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState(null);
  const postsPerPage = 12;

  const client = new WordPressGraphQLClient('https://www.worldcouncilforhealth.org/graphql');

  const fetchCategoryPosts = async (after = null) => {
    try {
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
        first: postsPerPage,
        after: after
      };

      const data = await client.query(query, variables);
      return data;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const loadInitialPosts = async () => {
      try {
        const data = await fetchCategoryPosts();
        setCategory(data.category);
        setPosts(data.category.posts.nodes);
        setHasMore(data.category.posts.pageInfo.hasNextPage);
        setEndCursor(data.category.posts.pageInfo.endCursor);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadInitialPosts();
  }, [categorySlug]);

  const loadMorePosts = async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const data = await fetchCategoryPosts(endCursor);
      setPosts([...posts, ...data.category.posts.nodes]);
      setHasMore(data.category.posts.pageInfo.hasNextPage);
      setEndCursor(data.category.posts.pageInfo.endCursor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!category) return <div>Category not found</div>;

  return (
    <div className="category-template">
      <h1>{category.name}</h1>
      {category.description && (
        <div className="category-description" dangerouslySetInnerHTML={{ __html: category.description }} />
      )}
      
      <div className="posts-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            {post.featuredImage?.node && (
              <img 
                src={post.featuredImage.node.sourceUrl} 
                alt={post.featuredImage.node.altText || post.title} 
              />
            )}
            <h2 dangerouslySetInnerHTML={{ __html: post.title }} />
            <div dangerouslySetInnerHTML={{ __html: post.excerpt }} />
            <p>By {post.author?.node?.name}</p>
            <a href={`/posts/${post.slug}`}>Read more</a>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <button 
          onClick={loadMorePosts} 
          disabled={loadingMore}
          className="load-more-button"
        >
          {loadingMore ? 'Loading...' : 'Load More Posts'}
        </button>
      )}
    </div>
  );
}

export default CategoryTemplate; 