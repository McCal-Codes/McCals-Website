import { SpeedInsights } from '@vercel/speed-insights/react';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getSpeedInsightsRoute } from '@/utils/speedInsightsRoutes';

const isVercelRuntime = ['preview', 'production'].includes(
  import.meta.env.VITE_VERCEL_ENV ?? '',
);

const enableSpeedInsights =
  import.meta.env.PROD &&
  isVercelRuntime &&
  import.meta.env.VITE_ENABLE_VERCEL_SPEED_INSIGHTS !== 'false';

type SpeedInsightsEvent = {
  type: 'vital';
  url: string;
  route?: string;
};

export default function RouteAwareSpeedInsights() {
  const location = useLocation();
  const route = useMemo(() => getSpeedInsightsRoute(location.pathname), [location.pathname]);
  const beforeSend = useCallback(
    (event: SpeedInsightsEvent) => ({
      ...event,
      route: event.route || route,
    }),
    [route],
  );

  if (!enableSpeedInsights) return null;

  return <SpeedInsights route={route} sampleRate={1} beforeSend={beforeSend} />;
}
