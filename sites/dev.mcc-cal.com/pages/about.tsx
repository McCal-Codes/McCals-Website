import Head from 'next/head';
import Layout from '../components/Layout/Layout';

const AboutPage = () => (
  <Layout>
    <Head>
      <title>About | McCal Media</title>
      <meta name="description" content="Learn about Caleb McCartney — photographer and photojournalist behind McCal Media." />
      <link rel="canonical" href="https://mcc-cal.com/about" />
      <meta property="og:title" content="About | McCal Media" />
      <meta property="og:description" content="Learn about Caleb McCartney — photographer and photojournalist behind McCal Media." />
      <meta property="og:url" content="https://mcc-cal.com/about" />
      <meta name="twitter:title" content="About | McCal Media" />
      <meta name="twitter:description" content="Learn about Caleb McCartney — photographer and photojournalist behind McCal Media." />
    </Head>
    <section><h2>About</h2></section>
  </Layout>
);

export default AboutPage;
