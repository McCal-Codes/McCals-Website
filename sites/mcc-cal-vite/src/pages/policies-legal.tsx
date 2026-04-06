import { Layout } from '@/components';
import { WidgetEmbed } from '@/components/widgets/WidgetEmbed';
import { getWidgetConfig } from '@/utils/widgetConfig';
import { usePageMeta } from '@/hooks/usePageMeta';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

const PoliciesLegalPage = () => {
  usePageMeta({
    title: 'Policies & Legal | McCal Media',
    description: 'Terms of service, privacy policy, licensing information, and legal notices for McCal Media.',
    canonical: `${SITE_URL}/policies-legal`,
    og: {
      type: 'website',
      title: 'Policies & Legal | McCal Media',
      description: 'Terms of service, privacy policy, and legal notices for McCal Media.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    twitter: {
      card: 'summary',
      title: 'Policies & Legal | McCal Media',
      description: 'Terms of service, privacy policy, and legal notices for McCal Media.',
      image: `${SITE_URL}/about/caleb-mccartney-photo.jpg`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Policies & Legal',
      description: 'Terms of service, privacy policy, and legal notices for McCal Media.',
      url: `${SITE_URL}/policies-legal`,
    },
  });
  const config = getWidgetConfig('policies-legal');
  if (!config) return <div>Widget not found</div>;

  return (
    <Layout>
      <WidgetEmbed widget={config.widget} category={config.category} />
    </Layout>
  );
};

export default PoliciesLegalPage;
