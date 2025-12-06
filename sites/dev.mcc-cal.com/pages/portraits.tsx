import Layout from '../components/Layout/Layout';
import WidgetEmbed from '../components/widgets/WidgetEmbed';
import { getWidgetConfig } from '../utils/widgetConfig';

const PortraitsPage = () => {
  const config = getWidgetConfig('portraits');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} version={config.version} />
    </Layout>
  );
};

export default PortraitsPage;
