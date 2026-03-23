import Layout from '@/components/Layout/Layout';
import { WidgetEmbed } from '@/components/widgets/WidgetEmbed';
import { getWidgetConfig } from '@/utils/widgetConfig';

const ContactUsPage = () => {
  const config = getWidgetConfig('contact-us');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} category={config.category} />
    </Layout>
  );
};

export default ContactUsPage;
