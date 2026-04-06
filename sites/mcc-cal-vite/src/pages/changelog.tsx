import { Layout, ChangelogViewer } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';

const ChangelogPage = () => (
  <Layout>
    <ChangelogViewer />
  </Layout>
);

export default ChangelogPage;
