import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getCanonicalPath, getStaticRouteByPath } from '@/config/public-routes.js';
import { trackWebsiteEvent } from '@/utils/analytics';

function resolveAnalyticsRoute(pathname: string) {
  const staticRoute = getStaticRouteByPath(pathname);
  if (staticRoute) {
    return {
      routeKey: staticRoute.routeKey,
      canonicalPath: staticRoute.path,
      pageType: 'static',
    };
  }

  if (pathname.startsWith('/blog/')) {
    return {
      routeKey: 'blogDetail',
      canonicalPath: pathname,
      pageType: 'blog',
    };
  }

  if (pathname.startsWith('/authors/')) {
    return {
      routeKey: 'authorDetail',
      canonicalPath: pathname,
      pageType: 'author',
    };
  }

  return {
    routeKey: 'unmapped',
    canonicalPath: getCanonicalPath(pathname),
    pageType: 'other',
  };
}

export default function RouteAnalytics() {
  const location = useLocation();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    const trackingKey = `${location.pathname}${location.search}`;
    if (lastTrackedRef.current === trackingKey) {
      return;
    }

    lastTrackedRef.current = trackingKey;
    const route = resolveAnalyticsRoute(location.pathname);

    trackWebsiteEvent('page_view', {
      pathname: location.pathname,
      canonicalPath: route.canonicalPath,
      routeKey: route.routeKey,
      pageType: route.pageType,
      pageTitle: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}
