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
  | 'video'
  | 'events'
  | 'concerts'
  | 'blog'
  | 'authors'
  | 'podcast'
  | 'bookPodcast'
  | 'grabCoffee'
  | 'faq'
  | 'designSystems'
  | 'projects'
  | 'terranova'
  | 'policiesLegal';

export interface StaticPageRoute {
  path: string;
  routeKey: StaticRouteKey;
  changefreq: 'weekly' | 'monthly' | 'yearly';
  priority: string;
}

export const STATIC_PAGE_ROUTES: ReadonlyArray<StaticPageRoute>;
export const SITEMAP_STATIC_PATHS: ReadonlyArray<string>;
