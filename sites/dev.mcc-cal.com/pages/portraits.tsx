import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import { WidgetEmbed } from '../components/widgets/WidgetEmbed';
import { getWidgetConfig } from '../utils/widgetConfig';

const PortraitsPage = () => {
  const config = getWidgetConfig('portraits');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <Head>
        <title>Portrait Photography | McCal Media</title>
        <meta name="description" content="Portrait photography portfolio by Caleb McCartney — personal, professional, and artistic portraits." />
      </Head>
      <WidgetEmbed widget={config.widget} category={config.category} version={config.version} />
    </Layout>
  );
};

export default PortraitsPage;
