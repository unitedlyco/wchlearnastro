import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Substack [page].astro', () => {
  const filePath = path.resolve('./src/pages/substack/[page].astro');
  let fileContent;
  let lines;

  beforeEach(() => {
    // Read the file content
    fileContent = fs.readFileSync(filePath, 'utf8');
    lines = fileContent.split('\n');
  });

  it('should have valid Astro frontmatter syntax', () => {
    // Check if the file starts with --- and has a closing ---
    expect(fileContent.startsWith('---')).toBe(true);
    
    // Find the closing frontmatter delimiter
    const closingDelimiterIndex = lines.findIndex((line, index) => index > 0 && line === '---');
    expect(closingDelimiterIndex).toBeGreaterThan(0);
  });

  it('should have proper frontmatter structure', () => {
    // Check if there's a proper closing of the frontmatter
    const frontmatterEndIndex = lines.findIndex((line, index) => index > 0 && line === '---');
    
    // Check if there's a proper HTML section after the frontmatter
    expect(lines[frontmatterEndIndex + 1].trim()).toBe('');
    expect(lines[frontmatterEndIndex + 2].trim().startsWith('<Layout')).toBe(true);
  });

  it('should have all required imports', () => {
    expect(fileContent.includes("import Layout from '../../layouts/Layout.astro'")).toBe(true);
    expect(fileContent.includes("import Hero from '../../components/blocks/hero/PageHeader.astro'")).toBe(true);
    expect(fileContent.includes("import BlogPosts from '../../components/blocks/blog/BlogPosts.astro'")).toBe(true);
    expect(fileContent.includes("import Pagination from '../../components/ui/Pagination.astro'")).toBe(true);
    expect(fileContent.includes("import substackClient from '../../lib/substack.js'")).toBe(true);
  });

  it('should have proper interface definitions', () => {
    expect(fileContent.includes('interface SubstackPost {')).toBe(true);
    expect(fileContent.includes('interface PaginationData {')).toBe(true);
  });

  it('should have server-side rendering implementation', () => {
    // Check that we're using server-side rendering
    expect(fileContent.includes('const { page } = Astro.params;')).toBe(true);
    expect(fileContent.includes('const currentPage = parseInt(page || \'1\');')).toBe(true);
    expect(fileContent.includes('const { posts, pagination } = await substackClient.getPaginatedPosts(currentPage);')).toBe(true);
    expect(fileContent.includes('const totalPages = pagination.totalPages;')).toBe(true);
  });

  it('should have proper transformedPosts mapping', () => {
    expect(fileContent.includes('const transformedPosts = posts.map(post => ({')).toBe(true);
    expect(fileContent.includes('title: post.title || \'Untitled Post\',')).toBe(true);
    expect(fileContent.includes('description: post.description || \'\',')).toBe(true);
    expect(fileContent.includes('pubDate: new Date(post.pubDate),')).toBe(true);
    expect(fileContent.includes('image: post.featuredImage || \'/placeholder-image.jpg\',')).toBe(true);
    expect(fileContent.includes('author: post.author || \'WCH Team\',')).toBe(true);
    expect(fileContent.includes('link: post.link,')).toBe(true);
    expect(fileContent.includes('tags: []')).toBe(true);
  });

  it('should have proper pagination URL generation', () => {
    expect(fileContent.includes('const prevUrl = currentPage === 2 ? \'/substack\' : `/substack/${currentPage - 1}`;')).toBe(true);
    expect(fileContent.includes('const nextUrl = currentPage < totalPages ? `/substack/${currentPage + 1}` : undefined;')).toBe(true);
  });

  it('should have proper HTML structure', () => {
    expect(fileContent.includes('<Layout title={SEO.title} description={SEO.description}>')).toBe(true);
    expect(fileContent.includes('<Hero title={header.title} text={header.text} />')).toBe(true);
    expect(fileContent.includes('<BlogPosts posts={transformedPosts} source="substack" />')).toBe(true);
    expect(fileContent.includes('<Pagination')).toBe(true);
    expect(fileContent.includes('currentPage={currentPage}')).toBe(true);
    expect(fileContent.includes('totalPages={totalPages}')).toBe(true);
    expect(fileContent.includes('prevUrl={prevUrl}')).toBe(true);
    expect(fileContent.includes('nextUrl={nextUrl}')).toBe(true);
    expect(fileContent.includes('</Layout>')).toBe(true);
  });
}); 