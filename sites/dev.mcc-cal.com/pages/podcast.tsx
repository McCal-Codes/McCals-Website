import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import { WidgetEmbed } from '../components/widgets/WidgetEmbed';
import { getWidgetConfig } from '../utils/widgetConfig';

const PodcastPage = () => {
  const config = getWidgetConfig('podcast');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <Head>
        <title>Podcast | McCal Media</title>
        <meta name="description" content="The McCal Media podcast — conversations about photography, journalism, and visual storytelling." />
        <link rel="canonical" href="https://mcc-cal.com/podcast" />
        <meta property="og:title" content="Podcast | McCal Media" />
        <meta property="og:description" content="The McCal Media podcast — conversations about photography, journalism, and visual storytelling." />
        <meta property="og:url" content="https://mcc-cal.com/podcast" />
        <meta name="twitter:title" content="Podcast | McCal Media" />
        <meta name="twitter:description" content="The McCal Media podcast — conversations about photography, journalism, and visual storytelling." />
      </Head>
      <WidgetEmbed widget={config.widget} category={config.category} version={config.version} />
    </Layout>
  );
};

export default PodcastPage;
