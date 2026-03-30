import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Layout/Footer';
import Nav from '@/components/Layout/Nav';
import HeroCarousel from '@/components/HeroCarousel';
import {
  type HomeFeaturedItem,
  LIVE_SITE_HOME_FEATURED_ITEMS,
  LIVE_SITE_PODCAST,
  mergeHomeFeaturedItems,
} from '@/content/liveSiteFallbacks';
import { usePageMeta } from '@/hooks/usePageMeta';
import styles from '@/styles/homepage.module.css';
import { fetchFeaturedItems, formatDate } from '@/utils/api-client';
import { useBlogPosts } from '@/utils/useAPI';

const HomePage = () => {
  usePageMeta({
    title: 'Caleb McCartney | Photojournalism, Events, Concerts, and Portraiture',
    description:
      'Photojournalism, events, concerts, portraits, and creative projects by Caleb McCartney, with writing, podcast conversations, and clear paths into the work.',
    canonical: 'https://mcc-cal.com/',
    og: {
      type: 'website',
      title: 'Caleb McCartney',
      description:
        'Photojournalism, events, concerts, portraits, and creative projects by Caleb McCartney.',
      image: LIVE_SITE_HOME_FEATURED_ITEMS[0]?.imageUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Caleb McCartney',
      description:
        'Photojournalism, events, concerts, portraits, and creative projects by Caleb McCartney.',
      image: LIVE_SITE_HOME_FEATURED_ITEMS[0]?.imageUrl,
    },
  });

  const [featuredItems, setFeaturedItems] = useState<HomeFeaturedItem[]>(LIVE_SITE_HOME_FEATURED_ITEMS);
  const { posts, loading: blogLoading, error: blogError } = useBlogPosts();

  useEffect(() => {
    let active = true;

    fetchFeaturedItems()
      .then((items) => {
        if (active) {
          setFeaturedItems(mergeHomeFeaturedItems(items));
        }
      })
      .catch(() => {
        if (active) {
          setFeaturedItems(LIVE_SITE_HOME_FEATURED_ITEMS);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const latestPosts = posts.slice(0, 3);

  return (
    <div className="site-layout" style={{ paddingTop: 0 }}>
      <Nav />
      <main className="site-main" style={{ marginTop: 0 }}>
        <HeroCarousel />
        <div className={styles.homeStory}>
          <div className={styles.homeInner}>
            <section className={styles.section} aria-labelledby="home-featured-work">
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionLabel}>Selected Work</p>
                  <h2 className={styles.sectionTitle} id="home-featured-work">
                    Curated assignments, performances, and stories.
                  </h2>
                  <p className={styles.sectionText}>
                    A tighter front door into the portfolio, with a few representative lanes instead of
                    asking visitors to parse the full archive first.
                  </p>
                </div>
                <Link className={styles.sectionLink} to="/featured-work">
                  Explore all work
                </Link>
              </div>

              <div className={styles.featuredGrid}>
                {featuredItems.map((item) => (
                  <article key={item.id} className={styles.featureCard}>
                    <Link className={styles.featureCardLink} to={item.href}>
                      <div className={styles.featureCardMedia}>
                        {item.imageUrl ? (
                          <img
                            className={styles.featureCardImage}
                            src={item.imageUrl}
                            alt={item.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className={styles.featureFallback}>Featured image unavailable</div>
                        )}
                      </div>
                      <div className={styles.featureCardBody}>
                        <span className={styles.featureEyebrow}>{item.eyebrow}</span>
                        <h3 className={styles.featureTitle}>{item.title}</h3>
                        <p className={styles.featureMeta}>{item.meta}</p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.section} aria-labelledby="home-latest-blog">
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionLabel}>Latest Writing</p>
                  <h2 className={styles.sectionTitle} id="home-latest-blog">
                    Reporting and longer-form notes from the field.
                  </h2>
                  <p className={styles.sectionText}>
                    The writing side should sit beside the photography, not behind it. Recent posts make
                    that editorial thread visible on the homepage.
                  </p>
                </div>
                <Link className={styles.sectionLink} to="/blog">
                  Visit the blog
                </Link>
              </div>

              {!blogLoading && !blogError && latestPosts.length > 0 && (
                <div className={styles.blogGrid}>
                  {latestPosts.map((post) => (
                    <article key={post.slug} className={styles.blogCard}>
                      <Link className={styles.blogCardLink} to={`/blog/${post.slug}`}>
                        <div className={styles.blogCardMedia}>
                          {post.leadImage ? (
                            <img
                              className={styles.blogCardImage}
                              src={post.leadImage}
                              alt={post.leadImageAlt || post.title}
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        <div className={styles.blogCardBody}>
                          <p className={styles.blogMeta}>
                            {[post.category, formatDate(post.date)].filter(Boolean).join(' / ')}
                          </p>
                          <h3 className={styles.blogTitle}>{post.title}</h3>
                          <p className={styles.blogExcerpt}>
                            {post.excerpt || 'Read the latest story from the blog.'}
                          </p>
                          <p className={styles.blogMeta}>By {post.author.name}</p>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}

              {blogLoading && (
                <div className={styles.featureFallback}>Loading the latest blog posts...</div>
              )}

              {!blogLoading && blogError && (
                <div className={styles.featureFallback}>
                  The blog preview could not load right now. The full archive is still available on the blog
                  page.
                </div>
              )}

              {!blogLoading && !blogError && latestPosts.length === 0 && (
                <div className={styles.featureFallback}>No published posts are available yet.</div>
              )}
            </section>

            <section className={styles.podcastSection} aria-labelledby="home-podcast">
              <div className={styles.podcastArtWrap}>
                <img
                  className={styles.podcastArt}
                  src={LIVE_SITE_PODCAST.image}
                  alt="Caffeinated Connections podcast artwork"
                  loading="lazy"
                />
              </div>
              <div className={styles.podcastBody}>
                <p className={styles.podcastLabel}>Podcast</p>
                <h2 className={styles.podcastTitle} id="home-podcast">
                  Conversations with creators, builders, and people figuring it out in public.
                </h2>
                <p className={styles.podcastText}>
                  Caffeinated Connections sits a little closer to process than promotion. It is part
                  interview, part coffee chat, and a useful bridge between the client work, the writing,
                  and the people behind both.
                </p>
                <div className={styles.podcastActions}>
                  <Link className={styles.buttonPrimary} to="/podcast">
                    Listen on site
                  </Link>
                  <a
                    className={styles.buttonGhost}
                    href={LIVE_SITE_PODCAST.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Spotify
                  </a>
                  <a
                    className={styles.buttonGhost}
                    href={LIVE_SITE_PODCAST.apple}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apple Podcasts
                  </a>
                  <a
                    className={styles.buttonGhost}
                    href={LIVE_SITE_PODCAST.calendly}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book an episode
                  </a>
                </div>
              </div>
            </section>

            <section className={styles.ctaPanel} aria-labelledby="home-cta">
              <p className={styles.sectionLabel}>Start Here</p>
              <h2 className={styles.ctaTitle} id="home-cta">
                Choose the path that fits what you need next.
              </h2>
              <p className={styles.ctaText}>
                Explore the portfolio, read the latest reporting, or move directly into a conversation
                about coverage, creative direction, or a project that needs documenting well.
              </p>
              <div className={styles.ctaActions}>
                <Link className={styles.buttonPrimary} to="/request-a-quote">
                  Request a quote
                </Link>
                <Link className={styles.buttonGhost} to="/featured-work">
                  Featured work
                </Link>
                <Link className={styles.buttonGhost} to="/blog">
                  Read the blog
                </Link>
                <Link className={styles.buttonGhost} to="/about">
                  About Caleb
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
