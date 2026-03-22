import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import { WidgetEmbed } from '../components/widgets/WidgetEmbed';
import { getWidgetConfig } from '../utils/widgetConfig';

const NaturePage = () => {
  const config = getWidgetConfig('nature');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <Head>
        <title>Nature Photography | McCal Media</title>
        <meta name="description" content="Nature and wildlife photography portfolio by Caleb McCartney — landscapes, flora, and fauna." />
        <link rel="canonical" href="https://mcc-cal.com/nature" />
        <meta property="og:title" content="Nature Photography | McCal Media" />
        <meta property="og:description" content="Nature and wildlife photography portfolio by Caleb McCartney — landscapes, flora, and fauna." />
        <meta property="og:url" content="https://mcc-cal.com/nature" />
        <meta name="twitter:title" content="Nature Photography | McCal Media" />
        <meta name="twitter:description" content="Nature and wildlife photography portfolio by Caleb McCartney — landscapes, flora, and fauna." />
      </Head>
      <WidgetEmbed widget={config.widget} category={config.category} version={config.version} />
    </Layout>
  );
};

export default NaturePage;
