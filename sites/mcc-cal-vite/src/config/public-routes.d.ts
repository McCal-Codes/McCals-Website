export type StaticRouteKey =
  | 'home'
  | 'about'
  | 'contactUs'
  | 'requestAQuote'
  | 'featuredWork'
  | 'lettingMeGo'
  | 'journalism'
  | 'portraits'
  | 'nature'
  | 'events'
  | 'concerts'
  | 'blog'
  | 'authors'
  | 'podcast'
  | 'bookPodcast'
  | 'grabCoffee'
  | 'faq'
  | 'projects'
  | 'accessibility'
  | 'licensing'
  | 'privacy'
  | 'terms'
  | 'policiesLegal';

export type StaticRouteSeoKey = StaticRouteKey | 'authorMccal';

export interface StaticPageRoute {
  path: string;
  routeKey: StaticRouteKey;
  seoKey?: StaticRouteSeoKey;
  changefreq: 'weekly' | 'monthly' | 'yearly';
  priority: string;
  redirectFrom?: readonly string[];
}

export const STATIC_PAGE_ROUTES: ReadonlyArray<StaticPageRoute>;
export const SITEMAP_STATIC_PATHS: ReadonlyArray<string>;
export const LEGACY_ROUTE_REDIRECTS: ReadonlyArray<{ from: string; to: string }>;
export function getStaticRouteByPath(path: string): StaticPageRoute | null;
export function getStaticRouteBySeoKey(seoKey: StaticRouteSeoKey): StaticPageRoute | null;
export function getCanonicalPath(pathname: string): string;
