import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import { WidgetEmbed } from '../components/widgets/WidgetEmbed';
import { WidgetReloader } from '../components/widgets/WidgetReloader';
import { getWidgetConfig } from '../utils/widgetConfig';

const JournalismPage = () => {
  const config = getWidgetConfig('journalism');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <Head>
        <title>Photojournalism | McCal Media</title>
        <meta name="description" content="Photojournalism portfolio by Caleb McCartney — documentary and editorial photography." />
      </Head>
      <WidgetEmbed widget={config.widget} category={config.category} version={config.version} />
      <WidgetReloader widget={config.widget} version={config.version} />
    </Layout>
  );
};

export default JournalismPage;
