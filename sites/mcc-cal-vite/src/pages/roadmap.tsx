import { Layout } from '@/components';
import { WidgetEmbed } from '@/components/widgets/WidgetEmbed';
import { getWidgetConfig } from '@/utils/widgetConfig';

const RoadmapPage = () => {
  const config = getWidgetConfig('roadmap');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} category={config.category} />
    </Layout>
  );
};

export default RoadmapPage;
