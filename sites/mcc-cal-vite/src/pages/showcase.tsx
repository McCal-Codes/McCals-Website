/**
 * Component Showcase Page
 *
 * Demonstrates all Phase 2 components and their usage
 * Navigate to /showcase to see examples
 */

import { useState } from 'react';
import ManifestDisplay from '@/components/ManifestDisplay';
import BlogPostList from '@/components/BlogPostList';
import BlogPostDetail from '@/components/BlogPostDetail';
import AdminDashboard from '@/components/AdminDashboard';
import { useManifest, useBlogPost, useBlogPosts } from '@/utils/useAPI';

type ShowcaseView = 'manifest' | 'blog' | 'admin' | 'hooks';

export default function ShowcasePage() {
  const [activeView, setActiveView] = useState<ShowcaseView>('manifest');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  // Demonstrate manifest hook
  const concertManifest = useManifest('concert');
  const blogPosts = useBlogPosts();
  const selectedPost = useBlogPost(selectedSlug || undefined);

  const renderContent = () => {
    switch (activeView) {
      case 'manifest':
        return (
          <div>
            <h2>Manifest Display Component</h2>
            <p>This component displays portfolio statistics and metadata</p>

            <div className="mb-8">
              <h3>Concert Manifest</h3>
              <ManifestDisplay
                manifest={concertManifest.data || null}
                type="concert"
                loading={concertManifest.loading}
                error={concertManifest.error || undefined}
              />
            </div>

            <button
              onClick={() => concertManifest.refetch()}
              className="px-4 py-2 bg-blue-500 text-white border-0 rounded cursor-pointer hover:bg-blue-600 transition-colors"
            >
              Refresh Manifest
            </button>
          </div>
        );

      case 'blog':
        if (selectedSlug) {
          return (
            <BlogPostDetail
              post={selectedPost.post}
              loading={selectedPost.loading}
              error={selectedPost.error || undefined}
              onBack={() => setSelectedSlug(null)}
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
              onPostClick={(post) => setSelectedSlug(post.slug)}
            />

            <button
              onClick={() => blogPosts.refetch()}
              className="mt-5 px-4 py-2 bg-blue-500 text-white border-0 rounded cursor-pointer hover:bg-blue-600 transition-colors"
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

            <AdminDashboard apiUrl={import.meta.env.VITE_API_URL || 'https://api.mcc-cal.com'} />
          </div>
        );

      case 'hooks':
        return (
          <div>
            <h2>React Hooks</h2>
            <p>Custom hooks for API integration</p>

            <div className="mt-5">
              <h3>Available Hooks</h3>
              <ul>
                <li>
                  <code>useManifest(type, apiUrl)</code> - Fetch single manifest
                </li>
                <li>
                  <code>useBlogPosts(blogBase)</code> - Fetch all blog posts from static content
                </li>
                <li>
                  <code>useBlogPost(slug, blogBase)</code> - Fetch single blog post
                </li>
                <li>
                  <code>useManifests(types, apiUrl)</code> - Fetch multiple manifests
                </li>
                <li>
                  <code>useAPIHealth(apiUrl, pollInterval)</code> - Health check
                </li>
              </ul>

              <h3>Manifest Hook Example</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-auto">
                {`const { data, loading, error, refetch } = useManifest('concert');

if (loading) return <p>Loading...</p>;
if (error) return <p>Error: {error}</p>;

return (
  <ManifestDisplay 
    manifest={data} 
    type="concert" 
  );
);`}
              </pre>

              <h3>Current Hook States</h3>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-300 rounded">
                  <h4 className="mt-0">Concert Manifest</h4>
                  <p className="m-0 mb-1 text-gray-600 text-xs">Status</p>
                  <div
                    className={`text-lg font-bold ${
                      concertManifest.loading
                        ? 'text-orange-500'
                        : concertManifest.error
                          ? 'text-red-500'
                          : 'text-green-500'
                    }`}
                  >
                    {concertManifest.loading
                      ? 'Loading'
                      : concertManifest.error
                        ? 'Error'
                        : 'Ready'}
                  </div>
                  {concertManifest.data && (
                    <p className="mt-2 text-xs text-gray-600">
                      {concertManifest.data.totalImages || 0} images
                    </p>
                  )}
                </div>

                <div className="p-4 border border-gray-300 rounded">
                  <h4 className="mt-0">Blog Posts</h4>
                  <p className="m-0 mb-1 text-gray-600 text-xs">Status</p>
                  <div
                    className={`text-lg font-bold ${
                      blogPosts.loading
                        ? 'text-orange-500'
                        : blogPosts.error
                          ? 'text-red-500'
                          : 'text-green-500'
                    }`}
                  >
                    {blogPosts.loading ? 'Loading' : blogPosts.error ? 'Error' : 'Ready'}
                  </div>
                  {blogPosts.posts && (
                    <p className="mt-2 text-xs text-gray-600">
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
    <div className="max-w-5xl mx-auto px-5">
      <h1>Phase 2 Components Showcase</h1>

      <div className="mb-8 border-b border-gray-300 pb-5">
        <p className="text-gray-600">
          This page demonstrates all Phase 2 components and hooks. Use the tabs below to explore
          each component.
        </p>

        <div className="flex gap-2 flex-wrap">
          {(['manifest', 'blog', 'admin', 'hooks'] as ShowcaseView[]).map((view) => (
            <button
              key={view}
              onClick={() => {
                setActiveView(view);
                setSelectedSlug(null);
              }}
              className={`px-5 py-2 border-0 rounded cursor-pointer transition-colors ${
                activeView === view
                  ? 'bg-blue-500 text-white font-bold'
                  : 'bg-gray-100 text-gray-800 font-normal hover:bg-gray-200'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-96">{renderContent()}</div>

      <div className="mt-12 p-5 bg-gray-100 rounded">
        <h3 className="mt-0">Development Notes</h3>
        <ul>
          <li>Components are fully responsive and support light/dark themes</li>
          <li>All components have loading and error states</li>
          <li>Hooks automatically handle caching and API errors</li>
          <li>Use the API Test page (/api-test) to verify endpoints</li>
          <li>Check browser console for detailed error messages</li>
        </ul>
      </div>

      <div className="mt-5 p-5 bg-blue-50 rounded">
        <h3 className="mt-0">Next Steps</h3>
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
