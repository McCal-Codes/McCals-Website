import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import { WidgetEmbed } from '../components/widgets/WidgetEmbed';
import { WidgetReloader } from '../components/widgets/WidgetReloader';
import { getWidgetConfig } from '../utils/widgetConfig';

const ConcertsPage = () => {
  const config = getWidgetConfig('concerts');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <Head>
        <title>Concert Photography | McCal Media</title>
        <meta name="description" content="Concert and live music photography portfolio by Caleb McCartney — capturing the energy of live performances." />
        <link rel="canonical" href="https://mcc-cal.com/concerts" />
        <meta property="og:title" content="Concert Photography | McCal Media" />
        <meta property="og:description" content="Concert and live music photography portfolio by Caleb McCartney — capturing the energy of live performances." />
        <meta property="og:url" content="https://mcc-cal.com/concerts" />
        <meta name="twitter:title" content="Concert Photography | McCal Media" />
        <meta name="twitter:description" content="Concert and live music photography portfolio by Caleb McCartney — capturing the energy of live performances." />
      </Head>
      <WidgetEmbed widget={config.widget} category={config.category} version={config.version} />
      <WidgetReloader widget={config.widget} version={config.version} />
    </Layout>
  );
};

export default ConcertsPage;
