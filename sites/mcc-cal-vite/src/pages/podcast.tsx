import Layout from '@/components/Layout/Layout';
import { WidgetEmbed } from '@/components/widgets/WidgetEmbed';
import { getWidgetConfig } from '@/utils/widgetConfig';

const PodcastPage = () => {
  const config = getWidgetConfig('podcast');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} category={config.category} version={config.version} />
    </Layout>
  );
};

export default PodcastPage;
