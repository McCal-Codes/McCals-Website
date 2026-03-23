import Layout from '@/components/Layout/Layout';
import { WidgetEmbed } from '@/components/widgets/WidgetEmbed';
import { getWidgetConfig } from '@/utils/widgetConfig';

const RequestAQuotePage = () => {
  const config = getWidgetConfig('request-a-quote');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} version={config.version} category={config.category} />
    </Layout>
  );
};

export default RequestAQuotePage;
