import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import { WidgetEmbed } from '../components/widgets/WidgetEmbed';
import { getWidgetConfig } from '../utils/widgetConfig';

const AbridgedPage = () => {
  const config = getWidgetConfig('abridged');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <Head>
        <title>Abridged App | McCal Media</title>
        <meta name="description" content="Abridged — a curated portfolio app by McCal Media showcasing the best of Caleb McCartney's photography work." />
        <link rel="canonical" href="https://mcc-cal.com/abridged" />
        <meta property="og:title" content="Abridged App | McCal Media" />
        <meta property="og:description" content="Abridged — a curated portfolio app by McCal Media showcasing the best of Caleb McCartney's photography work." />
        <meta property="og:url" content="https://mcc-cal.com/abridged" />
        <meta name="twitter:title" content="Abridged App | McCal Media" />
        <meta name="twitter:description" content="Abridged — a curated portfolio app by McCal Media showcasing the best of Caleb McCartney's photography work." />
      </Head>
      <WidgetEmbed widget={config.widget} category={config.category} version={config.version} />
    </Layout>
  );
};

export default AbridgedPage;
