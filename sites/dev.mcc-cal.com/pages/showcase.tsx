/**
 * Component Showcase Page
 * 
 * Demonstrates all Phase 2 components and their usage
 * Navigate to /showcase to see examples
 */

import { useState } from 'react';
import ManifestDisplay from '../components/ManifestDisplay';
import BlogPostList from '../components/BlogPostList';
import BlogPostDetail from '../components/BlogPostDetail';
import AdminDashboard from '../components/AdminDashboard';
import { useManifest, useBlogPosts } from '../utils/useAPI';
import type { BlogPost } from '../utils/api-client';

type ShowcaseView = 'manifest' | 'blog' | 'admin' | 'hooks';

export default function ShowcasePage() {
  const [activeView, setActiveView] = useState<ShowcaseView>('manifest');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Demonstrate manifest hook
  const concertManifest = useManifest('concert');
  const blogPosts = useBlogPosts();

  const renderContent = () => {
    switch (activeView) {
      case 'manifest':
        return (
          <div>
            <h2>Manifest Display Component</h2>
            <p>This component displays portfolio statistics and metadata</p>

            <div style={{ marginBottom: '30px' }}>
              <h3>Concert Manifest</h3>
              <ManifestDisplay
                manifest={concertManifest.data || {}}
                type="concert"
                loading={concertManifest.loading}
                error={concertManifest.error || undefined}
              />
            </div>

            <button
              onClick={() => concertManifest.refetch()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Refresh Manifest
            </button>
          </div>
        );

      case 'blog':
        if (selectedPost) {
          return (
            <BlogPostDetail
              post={selectedPost}
              onBack={() => setSelectedPost(null)}
            />
          );
        }

        return (
          <div>
            <h2>Blog Post Components</h2>
            <p>BlogPostList displays a grid of posts, BlogPostDetail shows individual posts</p>

            <BlogPostList
              posts={blogPosts.posts}
              loading={blogPosts.loading}
              error={blogPosts.error || undefined}
              onPostClick={setSelectedPost}
            />

            <button
              onClick={() => blogPosts.refetch()}
              style={{
                marginTop: '20px',
                padding: '8px 16px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Refresh Posts
            </button>
          </div>
        );

      case 'admin':
        return (
          <div>
            <h2>Admin Dashboard Component</h2>
            <p>Admin controls for system status and cache management</p>

            <AdminDashboard apiUrl={process.env.NEXT_PUBLIC_API_URL || 'https://api.mcc-cal.com'} />
          </div>
        );

      case 'hooks':
        return (
          <div>
            <h2>React Hooks</h2>
            <p>Custom hooks for API integration</p>

            <div style={{ marginTop: '20px' }}>
              <h3>Available Hooks</h3>
              <ul>
                <li>
                  <code>useManifest(type, apiUrl)</code> - Fetch single manifest
                </li>
                <li>
                  <code>useBlogPosts(apiUrl)</code> - Fetch all blog posts
                </li>
                <li>
                  <code>useBlogPost(id, apiUrl)</code> - Fetch single blog post
                </li>
                <li>
                  <code>useManifests(types, apiUrl)</code> - Fetch multiple manifests
                </li>
                <li>
                  <code>useAPIHealth(apiUrl, pollInterval)</code> - Health check
                </li>
              </ul>

              <h3>Manifest Hook Example</h3>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`const { data, loading, error, refetch } = useManifest('concert');

if (loading) return <p>Loading...</p>;
if (error) return <p>Error: {error}</p>;

return (
  <ManifestDisplay 
    manifest={data} 
    type="concert" 
  />
);`}
              </pre>

              <h3>Current Hook States</h3>
              <div
                style={{
                  marginTop: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                }}
              >
                <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <h4 style={{ marginTop: 0 }}>Concert Manifest</h4>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '12px' }}>
                    Status
                  </p>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: concertManifest.loading ? '#ff9800' : concertManifest.error ? '#f44336' : '#4caf50',
                    }}
                  >
                    {concertManifest.loading ? 'Loading' : concertManifest.error ? 'Error' : 'Ready'}
                  </div>
                  {concertManifest.data && (
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
                      {concertManifest.data.totalImages || 0} images
                    </p>
                  )}
                </div>

                <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <h4 style={{ marginTop: 0 }}>Blog Posts</h4>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '12px' }}>
                    Status
                  </p>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: blogPosts.loading ? '#ff9800' : blogPosts.error ? '#f44336' : '#4caf50',
                    }}
                  >
                    {blogPosts.loading ? 'Loading' : blogPosts.error ? 'Error' : 'Ready'}
                  </div>
                  {blogPosts.posts && (
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
                      {blogPosts.posts.length} posts
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Phase 2 Components Showcase</h1>

      <div style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <p style={{ color: '#666' }}>
          This page demonstrates all Phase 2 components and hooks. Use the tabs below to explore each component.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {(['manifest', 'blog', 'admin', 'hooks'] as ShowcaseView[]).map((view) => (
            <button
              key={view}
              onClick={() => {
                setActiveView(view);
                setSelectedPost(null);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: activeView === view ? '#2196f3' : '#f5f5f5',
                color: activeView === view ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: activeView === view ? 'bold' : 'normal',
              }}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ minHeight: '400px' }}>{renderContent()}</div>

      <div style={{ marginTop: '50px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0 }}>Development Notes</h3>
        <ul>
          <li>
            Components are fully responsive and support light/dark themes
          </li>
          <li>
            All components have loading and error states
          </li>
          <li>
            Hooks automatically handle caching and API errors
          </li>
          <li>
            Use the API Test page (/api-test) to verify endpoints
          </li>
          <li>
            Check browser console for detailed error messages
          </li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0 }}>Next Steps</h3>
        <ol>
          <li>Update existing pages to use these components</li>
          <li>Integrate with your site's layout and styling</li>
          <li>Customize colors and fonts to match your brand</li>
          <li>Add additional pages (portfolio dashboard, etc.)</li>
          <li>Deploy to production</li>
        </ol>
      </div>
    </div>
  );
}
