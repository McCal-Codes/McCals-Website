import Head from 'next/head';
import Layout from '../components/Layout/Layout';

const BlogPage = () => (
  <Layout>
    <Head>
      <title>Blog | McCal Media</title>
      <meta name="description" content="Articles, stories, and insights from Caleb McCartney on photography, photojournalism, and visual media." />
      <link rel="canonical" href="https://mcc-cal.com/blog" />
      <meta property="og:title" content="Blog | McCal Media" />
      <meta property="og:description" content="Articles, stories, and insights from Caleb McCartney on photography, photojournalism, and visual media." />
      <meta property="og:url" content="https://mcc-cal.com/blog" />
      <meta name="twitter:title" content="Blog | McCal Media" />
      <meta name="twitter:description" content="Articles, stories, and insights from Caleb McCartney on photography, photojournalism, and visual media." />
    </Head>
    <section><h2>Blog</h2></section>
  </Layout>
);

export default BlogPage;
