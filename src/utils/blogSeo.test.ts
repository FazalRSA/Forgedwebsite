import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { BLOG_PILLARS, blogPillarPath, blogPostPath, catalogueFacts, plainText, resolveText } from '../data/blog';
import { BLOG_POSTS, postsInPillar } from '../data/blogPosts';
import { blogStaticHtml } from '../components/blog/blogStatic';
import { BLOG_FEED_PATH, BLOG_PATH, blogLastmod, blogMetaForPath, blogSitemapPaths, buildBlogFeedXml } from './blogSeo';
import { buildSitemapXml, DEFAULT_SHARE_IMAGE, SITE_ORIGIN, absolutiseJsonLd, metaForPath, sitemapPaths } from './seo';
import { buildLlmsTxt } from './llms';

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public');

type Node = Record<string, any>;
const graphOf = (jsonLd: unknown): Node[] => (jsonLd as { '@graph': Node[] })['@graph'];

const ALL_BLOG_PATHS = [BLOG_PATH, ...BLOG_PILLARS.map(blogPillarPath), ...BLOG_POSTS.map(blogPostPath)];

test('every blog page is indexable, is its own canonical URL and has a title and description that fit a search result', () => {
  assert.equal(ALL_BLOG_PATHS.length, 1 + BLOG_PILLARS.length + BLOG_POSTS.length);
  for (const p of ALL_BLOG_PATHS) {
    const meta = metaForPath(p);
    assert.equal(meta.noindex, false, p);
    assert.equal(meta.canonicalPath, p);
    assert.ok(meta.title.length <= 60, `${p} title is ${meta.title.length} characters`);
    assert.ok(meta.description.length >= 100 && meta.description.length <= 160, `${p} description is ${meta.description.length}`);
    assert.ok(meta.jsonLd, `${p} has structured data`);
  }
  const titles = ALL_BLOG_PATHS.map((p) => metaForPath(p).title);
  assert.equal(new Set(titles).size, titles.length, 'every blog page has its own title');
  const descriptions = ALL_BLOG_PATHS.map((p) => metaForPath(p).description);
  assert.equal(new Set(descriptions).size, descriptions.length, 'every blog page has its own description');
});

test('an unknown blog address is a noindex "not found", never an indexable page', () => {
  const first = BLOG_POSTS[0];
  for (const bad of ['/blog/nope', '/blog/wheel-care/nope', `${blogPostPath(first)}/extra`, '/blog/feed']) {
    assert.equal(blogMetaForPath(bad), null, bad);
    const meta = metaForPath(bad);
    assert.equal(meta.noindex, true, bad);
    assert.ok(meta.title.startsWith('Page not found'));
    assert.ok(!sitemapPaths().includes(bad));
  }
});

test('an article carries BlogPosting, BreadcrumbList and FAQPage structured data that match the page', () => {
  const facts = catalogueFacts();
  for (const post of BLOG_POSTS) {
    const url = blogPostPath(post);
    const nodes = graphOf(metaForPath(url).jsonLd);
    const article = nodes.find((n) => n['@type'] === 'BlogPosting')!;
    assert.equal(article.headline, post.title);
    assert.equal(article.datePublished, post.published);
    assert.equal(article.dateModified, post.updated);
    assert.equal(article.mainEntityOfPage['@id'], url);
    assert.equal(article.image, DEFAULT_SHARE_IMAGE, 'article image is the site share image');
    assert.ok(article.wordCount > 300);
    assert.equal(article.author['@type'], 'Organization');

    const crumbs = nodes.find((n) => n['@type'] === 'BreadcrumbList')!;
    assert.deepEqual(
      crumbs.itemListElement.map((i: Node) => i.item),
      ['/', BLOG_PATH, blogPillarPath(BLOG_PILLARS.find((p) => p.id === post.pillar)!), url]
    );
    assert.deepEqual(crumbs.itemListElement.map((i: Node) => i.position), [1, 2, 3, 4]);

    const faq = nodes.find((n) => n['@type'] === 'FAQPage')!;
    assert.equal(faq.mainEntity.length, post.faqs.length);
    faq.mainEntity.forEach((q: Node, i: number) => {
      assert.equal(q.name, post.faqs[i].q);
      assert.equal(q.acceptedAnswer.text, plainText(resolveText(post.faqs[i].a, facts)));
      assert.ok(!/\]\(|\*\*/.test(q.acceptedAnswer.text), 'answers carry no markup');
    });

    // Relative addresses become absolute on the production host.
    const absolute = JSON.stringify(absolutiseJsonLd(metaForPath(url).jsonLd!, 'https://example.test'));
    assert.ok(absolute.includes(`"https://example.test${url}"`));
    assert.ok(!/"(?:url|item|@id)":"\//.test(absolute), 'no relative url is left');
  }
});

test('the hub and each pillar list exactly the articles that belong to them', () => {
  const hub = graphOf(metaForPath(BLOG_PATH).jsonLd);
  assert.equal(hub.find((n) => n['@type'] === 'Blog')!.blogPost.length, BLOG_POSTS.length);
  assert.equal(hub.find((n) => n['@type'] === 'ItemList')!.itemListElement.length, BLOG_POSTS.length);
  for (const pillar of BLOG_PILLARS) {
    const nodes = graphOf(metaForPath(blogPillarPath(pillar)).jsonLd);
    const list = nodes.find((n) => n['@type'] === 'ItemList')!;
    assert.deepEqual(
      list.itemListElement.map((i: Node) => i.url),
      postsInPillar(pillar.id).map(blogPostPath)
    );
    assert.ok(nodes.some((n) => n['@type'] === 'CollectionPage'));
  }
});

test('the sitemap lists every blog page once, with the article date as lastmod', () => {
  const paths = sitemapPaths();
  assert.equal(new Set(paths).size, paths.length);
  for (const p of ALL_BLOG_PATHS) assert.ok(paths.includes(p), `${p} is missing from the sitemap`);
  assert.deepEqual([...blogSitemapPaths()].sort(), [...ALL_BLOG_PATHS].sort());

  const xml = buildSitemapXml('https://example.test');
  for (const post of BLOG_POSTS) {
    assert.ok(
      xml.includes(`<loc>https://example.test${blogPostPath(post)}</loc><lastmod>${post.updated}</lastmod>`),
      `${post.slug} needs a lastmod`
    );
  }
  assert.equal(blogLastmod('/installs'), undefined);
  assert.ok(!xml.includes('<loc>https://example.test/</loc><lastmod>'), 'only blog pages carry a date');
});

test('the RSS feed lists every article, newest first, and escapes its text; the file on disk is current', () => {
  const xml = buildBlogFeedXml('https://example.test');
  assert.equal((xml.match(/<item>/g) ?? []).length, BLOG_POSTS.length);
  for (const post of BLOG_POSTS) assert.ok(xml.includes(`<link>https://example.test${blogPostPath(post)}</link>`));
  assert.ok(xml.includes('rel="self"') && xml.includes(`https://example.test${BLOG_FEED_PATH}`));
  assert.ok(!/<(?:title|description)>[^<]*&(?!amp;|lt;|gt;|quot;)/.test(xml), 'ampersands are escaped');
  const onDisk = readFileSync(path.join(PUBLIC_DIR, 'blog', 'feed.xml'), 'utf8');
  assert.equal(onDisk, buildBlogFeedXml(SITE_ORIGIN), 'run `npm run build` to regenerate public/blog/feed.xml');
  const shell = readFileSync(path.join(PUBLIC_DIR, '..', 'index.html'), 'utf8');
  assert.ok(shell.includes(`href="${BLOG_FEED_PATH}"`), 'index.html advertises the feed');
});

test('prerendered blog HTML carries the whole article, its links and its FAQ, and nothing for other pages', () => {
  for (const post of BLOG_POSTS) {
    const html = blogStaticHtml(blogPostPath(post));
    assert.ok(html.includes('<h1'), post.slug);
    assert.ok(html.includes(post.title.replace(/&/g, '&amp;')), `${post.slug} title`);
    assert.ok((html.match(/<h2/g) ?? []).length >= post.body.filter((b) => b.type === 'h2').length);
    assert.ok(html.includes('Frequently asked questions'), `${post.slug} FAQ`);
    for (const faq of post.faqs) assert.ok(html.includes(faq.q.replace(/&/g, '&amp;').replace(/’/g, '’')), `${post.slug} FAQ question`);
    assert.ok(/href="\/blog\//.test(html), `${post.slug} has internal links`);
    assert.ok(!/undefined|\[object/.test(html), `${post.slug} has a broken value`);
    assert.ok(!html.includes('](/'), `${post.slug} has unrendered link markup`);
    assert.ok(!html.includes('**'), `${post.slug} has unrendered bold markup`);
  }
  assert.ok(blogStaticHtml(BLOG_PATH).includes('Latest guides'));
  assert.ok(blogStaticHtml(blogPillarPath(BLOG_PILLARS[0])).includes(BLOG_PILLARS[0].title));
  assert.equal(blogStaticHtml('/installs'), '');
  assert.equal(blogStaticHtml('/blog/nope'), '');
});

test('llms.txt points AI assistants at the blog, its topics and every article', () => {
  const txt = buildLlmsTxt('https://example.test');
  assert.ok(txt.includes('## Guides'));
  assert.ok(txt.includes('(https://example.test/blog)'));
  for (const pillar of BLOG_PILLARS) assert.ok(txt.includes(`(https://example.test${blogPillarPath(pillar)})`));
  for (const post of BLOG_POSTS) assert.ok(txt.includes(`(https://example.test${blogPostPath(post)})`), post.slug);
});
