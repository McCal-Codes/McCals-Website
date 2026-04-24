import { useEffect } from 'react';

interface PortfolioItemSchemaProps {
  name: string;
  description: string;
  image: string;
  dateCreated?: string;
  author?: string;
  url: string;
}

export function PortfolioItemSchema({
  name,
  description,
  image,
  dateCreated,
  author,
  url,
}: PortfolioItemSchemaProps) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      name,
      description,
      contentUrl: image,
      url,
      author: author ? {
        '@type': 'Person',
        name: author,
      } : undefined,
      dateCreated,
      copyrightHolder: {
        '@type': 'Organization',
        name: 'McCal Media',
        url: 'https://mcc-cal.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://mcc-cal.com/brand/logo-mark.svg',
        },
      },
    };

    const scriptId = `schema-portfolio-${name.replace(/\s+/g, '-').toLowerCase()}`;
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      try {
        const existingScript = document.getElementById(scriptId);
        if (existingScript && existingScript.parentNode === document.head) {
          document.head.removeChild(existingScript);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [name, description, image, dateCreated, author, url]);

  return null;
}

interface BlogPostSchemaProps {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}

export function BlogPostSchema({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
}: BlogPostSchemaProps) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description,
      image: image ? [image] : undefined,
      author: {
        '@type': 'Person',
        name: author,
      },
      datePublished,
      dateModified: dateModified || datePublished,
      url,
      publisher: {
        '@type': 'Organization',
        name: 'McCal Media',
        logo: {
          '@type': 'ImageObject',
          url: 'https://mcc-cal.com/brand/logo-mark.svg',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
    };

    const scriptId = `schema-blog-${title.replace(/\s+/g, '-').toLowerCase()}`;
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      try {
        const existingScript = document.getElementById(scriptId);
        if (existingScript && existingScript.parentNode === document.head) {
          document.head.removeChild(existingScript);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [title, description, author, datePublished, dateModified, image, url]);

  return null;
}
