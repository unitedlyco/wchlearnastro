import { useState, useEffect } from 'react';
import WordPressGraphQLClient from './graphql-client';

function CategoryTemplate({ categorySlug }) {
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const client = new WordPressGraphQLClient('https://www.worldcouncilforhealth.org/graphql');
    
    const fetchCategoryPosts = async () => {
      try {
        const data = await client.getCategoryPosts(categorySlug, 12);
        setCategory(data.category);
        setPosts(data.category.posts.nodes);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCategoryPosts();
  }, [categorySlug]);

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
    </div>
  );
}

export default CategoryTemplate; 