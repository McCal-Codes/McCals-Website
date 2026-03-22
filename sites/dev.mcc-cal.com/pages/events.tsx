import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import { WidgetEmbed } from '../components/widgets/WidgetEmbed';
import { getWidgetConfig } from '../utils/widgetConfig';

const EventsPage = () => {
  const config = getWidgetConfig('events');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <Head>
        <title>Event Photography | McCal Media</title>
        <meta name="description" content="Event photography portfolio by Caleb McCartney — covering corporate, community, and special events." />
        <link rel="canonical" href="https://mcc-cal.com/events" />
        <meta property="og:title" content="Event Photography | McCal Media" />
        <meta property="og:description" content="Event photography portfolio by Caleb McCartney — covering corporate, community, and special events." />
        <meta property="og:url" content="https://mcc-cal.com/events" />
        <meta name="twitter:title" content="Event Photography | McCal Media" />
        <meta name="twitter:description" content="Event photography portfolio by Caleb McCartney — covering corporate, community, and special events." />
      </Head>
      <WidgetEmbed widget={config.widget} category={config.category} version={config.version} />
    </Layout>
  );
};

export default EventsPage;
