import { SITE } from '../config/site';
import {
  BLOG_PILLARS,
  blogPillarPath,
  blogPostPath,
  catalogueFacts,
  getPillarById,
  plainText,
  postWordCount,
  resolveText,
  type BlogPillar,
  type BlogPost,
} from '../data/blog';
import { BLOG_POSTS, latestPosts, postsInPillar, resolveBlogPath } from '../data/blogPosts';
import type { PageMeta } from './seo';

/**
 * Metadata, structured data, sitemap entries and the RSS feed for the blog. seo.ts calls
 * `blogMetaForPath`; the generator scripts call the sitemap and feed builders.
 */

/** Same file as DEFAULT_SHARE_IMAGE in seo.ts (blogSeo.test.ts checks they agree); written out here to keep the import one-way. */
const SHARE_IMAGE = '/images/share/forged-wheels-share.jpg';

/** Longest title that search results show without cutting it off (as in seo.ts). */
const MAX_TITLE_LENGTH = 60;

export const BLOG_PATH = '/blog';
export const BLOG_FEED_PATH = '/blog/feed.xml';

export const BLOG_HUB = {
  title: 'Forged wheel guides for BMW M owners',
  description:
    'Guides to forged wheels for BMW M cars in South Africa: how they are made, what fits, what they cost in Rand and how to look after them.',
};

/** "Title | FORGED Custom Wheels" when that fits in a search result, else the title alone. */
function withSiteName(title: string): string {
  const full = `${title} | ${SITE.name}`;
  return full.length <= MAX_TITLE_LENGTH ? full : title;
}

const publisher = () => ({ '@type': 'Organization', name: SITE.name, url: '/' });

function breadcrumbs(trail: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.path,
    })),
  };
}

function itemList(posts: BlogPost[]): Record<string, unknown> {
  return {
    '@type': 'ItemList',
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: post.title,
      url: blogPostPath(post),
    })),
  };
}

export function blogHubMeta(): PageMeta {
  const path = BLOG_PATH;
  return {
    title: withSiteName(BLOG_HUB.title),
    description: BLOG_HUB.description,
    canonicalPath: path,
    noindex: false,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Blog',
          name: `${SITE.name} blog`,
          description: BLOG_HUB.description,
          url: path,
          inLanguage: 'en-ZA',
          publisher: publisher(),
          blogPost: latestPosts().map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            url: blogPostPath(post),
            datePublished: post.published,
          })),
        },
        itemList(latestPosts()),
        breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Blog', path },
        ]),
      ],
    },
  };
}

export function blogPillarMeta(pillar: BlogPillar): PageMeta {
  const path = blogPillarPath(pillar);
  return {
    title: withSiteName(pillar.metaTitle),
    description: pillar.description,
    canonicalPath: path,
    noindex: false,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: pillar.title,
          description: pillar.description,
          url: path,
          inLanguage: 'en-ZA',
          isPartOf: { '@type': 'Blog', name: `${SITE.name} blog`, url: BLOG_PATH },
          publisher: publisher(),
        },
        itemList(postsInPillar(pillar.id)),
        breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: BLOG_PATH },
          { name: pillar.name, path },
        ]),
      ],
    },
  };
}

export function blogPostMeta(post: BlogPost): PageMeta {
  const path = blogPostPath(post);
  const pillar = getPillarById(post.pillar);
  const facts = catalogueFacts();
  const faqs = post.faqs
    .map((faq) => ({ q: faq.q, a: plainText(resolveText(faq.a, facts)) }))
    .filter((faq) => faq.a);
  return {
    title: withSiteName(post.metaTitle),
    description: post.description,
    canonicalPath: path,
    noindex: false,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          url: path,
          mainEntityOfPage: { '@type': 'WebPage', '@id': path },
          image: SHARE_IMAGE,
          datePublished: post.published,
          dateModified: post.updated,
          inLanguage: 'en-ZA',
          articleSection: pillar.name,
          keywords: [post.keyword, ...post.related].join(', '),
          wordCount: postWordCount(post, facts),
          author: publisher(),
          publisher: publisher(),
        },
        breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: BLOG_PATH },
          { name: pillar.name, path: blogPillarPath(pillar) },
          { name: post.title, path },
        ]),
        ...(faqs.length
          ? [
              {
                '@type': 'FAQPage',
                mainEntity: faqs.map((faq) => ({
                  '@type': 'Question',
                  name: faq.q,
                  acceptedAnswer: { '@type': 'Answer', text: faq.a },
                })),
              },
            ]
          : []),
      ],
    },
  };
}

/** Metadata for a blog path, or null when the path is not a blog page (seo.ts then treats it as "not found"). */
export function blogMetaForPath(path: string): PageMeta | null {
  const route = resolveBlogPath(path);
  if (!route) return null;
  if (route.kind === 'index') return blogHubMeta();
  if (route.kind === 'pillar') return blogPillarMeta(route.pillar);
  return blogPostMeta(route.post);
}

/** Every blog page address, for the sitemap: the hub, each pillar, each article. */
export function blogSitemapPaths(): string[] {
  return [BLOG_PATH, ...BLOG_PILLARS.map(blogPillarPath), ...BLOG_POSTS.map(blogPostPath)];
}

/** When a blog page last changed: an article's own date; the hub and pillars take their newest article's. */
export function blogLastmod(path: string): string | undefined {
  const route = resolveBlogPath(path);
  if (!route) return undefined;
  const newest = (posts: BlogPost[]) => posts.map((p) => p.updated).sort().at(-1);
  if (route.kind === 'post') return route.post.updated;
  if (route.kind === 'pillar') return newest(postsInPillar(route.pillar.id));
  return newest([...BLOG_POSTS]);
}

const xmlEscape = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** RSS 2.0 feed of every article, newest first. Written to public/blog/feed.xml by scripts/generate-sitemap.ts. */
export function buildBlogFeedXml(origin: string): string {
  const items = latestPosts()
    .map((post) => {
      const url = `${origin}${blogPostPath(post)}`;
      return [
        '    <item>',
        `      <title>${xmlEscape(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(`${post.published}T00:00:00Z`).toUTCString()}</pubDate>`,
        `      <category>${xmlEscape(getPillarById(post.pillar).name)}</category>`,
        `      <description>${xmlEscape(post.description)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');
  const newest = latestPosts(1)[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(`${SITE.name} blog`)}</title>
    <link>${origin}${BLOG_PATH}</link>
    <description>${xmlEscape(BLOG_HUB.description)}</description>
    <language>en-za</language>
${newest ? `    <lastBuildDate>${new Date(`${newest.updated}T00:00:00Z`).toUTCString()}</lastBuildDate>\n` : ''}    <atom:link href="${origin}${BLOG_FEED_PATH}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
