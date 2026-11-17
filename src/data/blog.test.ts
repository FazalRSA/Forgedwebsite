import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE } from '../config/site';
import { formatZAR, getAllBrandWheels } from './catalogue';
import {
  BLOG_PILLARS,
  blogPostPath,
  catalogueFacts,
  designRows,
  getPillarById,
  headingId,
  plainText,
  postWordCount,
  readingMinutes,
  resolveText,
  type BlogPost,
  type CatalogueFacts,
  type Text,
} from './blog';
import { BLOG_POSTS, getPost, latestPosts, morePosts, postsInPillar, resolveBlogPath } from './blogPosts';

const LIVE = catalogueFacts();

/** Facts with nothing in them (no wheels in stock) and obvious markers for the two constants, so a typed-in number stands out. */
const EMPTY: CatalogueFacts = { ...catalogueFacts([]), leadTime: 'LEADTIME', toOrderNotice: 'NOTICE' };

/** Every piece of text in a post, resolved with the given facts. */
function textsOf(post: BlogPost, facts: CatalogueFacts): string[] {
  const out: string[] = [post.title, post.metaTitle, post.description, post.excerpt];
  const add = (text: Text) => out.push(resolveText(text, facts));
  for (const block of post.body) {
    switch (block.type) {
      case 'h2':
      case 'h3':
        out.push(block.text);
        break;
      case 'p':
        add(block.text);
        break;
      case 'callout':
        if (block.title) out.push(block.title);
        add(block.text);
        break;
      case 'ul':
      case 'ol':
        block.items.forEach(add);
        break;
      case 'table':
        out.push(...block.head);
        if (block.caption) out.push(block.caption);
        block.rows.forEach((row) => row.forEach(add));
        break;
      case 'stock':
        out.push(block.heading);
        if (block.intro) add(block.intro);
        break;
      case 'designTable':
        if (block.caption) out.push(block.caption);
        break;
      case 'cta':
        out.push(block.heading);
        add(block.text);
        break;
    }
  }
  for (const faq of post.faqs) {
    out.push(faq.q);
    add(faq.a);
  }
  return out;
}

const PILLAR_SLUGS = BLOG_PILLARS.map((p) => p.slug);

test('there are four content pillars, each with several articles', () => {
  assert.equal(BLOG_PILLARS.length, 4);
  assert.equal(new Set(BLOG_PILLARS.map((p) => p.id)).size, 4);
  assert.equal(new Set(PILLAR_SLUGS).size, 4);
  for (const pillar of BLOG_PILLARS) {
    assert.ok(postsInPillar(pillar.id).length >= 3, `${pillar.id} needs at least three articles`);
    assert.ok(pillar.metaTitle.length <= 60, `${pillar.id} metaTitle too long`);
    assert.ok(pillar.description.length >= 100 && pillar.description.length <= 170, `${pillar.id} description length`);
    assert.ok(pillar.intro.length >= 1);
  }
});

test('every article has a unique slug, a real pillar, a short title and a description that fits a search result', () => {
  assert.equal(new Set(BLOG_POSTS.map((p) => p.slug)).size, BLOG_POSTS.length);
  for (const post of BLOG_POSTS) {
    assert.match(post.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, post.slug);
    assert.ok(getPillarById(post.pillar), post.slug);
    assert.ok(post.metaTitle.length > 20 && post.metaTitle.length <= 60, `${post.slug} metaTitle is ${post.metaTitle.length} characters`);
    assert.ok(post.description.length >= 100 && post.description.length <= 160, `${post.slug} description is ${post.description.length} characters`);
    assert.ok(post.excerpt.length >= 40 && post.excerpt.length <= 160, `${post.slug} excerpt`);
    assert.ok(post.keyword.length > 3);
    assert.ok(post.related.length >= 2, `${post.slug} lists related search phrases`);
    assert.match(post.published, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(post.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(post.updated >= post.published, `${post.slug} was updated before it was published`);
  }
});

test('every article is built to rank: its keyword is in the title or description, and the page has structure', () => {
  for (const post of BLOG_POSTS) {
    const haystack = `${post.title} ${post.metaTitle} ${post.description}`.toLowerCase();
    const words = post.keyword.toLowerCase().split(/\s+/);
    const hits = words.filter((w) => haystack.includes(w.replace(/s$/, '')));
    assert.ok(hits.length >= Math.ceil(words.length * 0.6), `${post.slug}: keyword "${post.keyword}" should appear in the title or description`);

    const headings = post.body.filter((b) => b.type === 'h2');
    assert.ok(headings.length >= 3, `${post.slug} needs at least three sections`);
    assert.equal(post.body[0].type, 'p', `${post.slug} should open with a paragraph that answers the question`);
    assert.ok(post.faqs.length >= 2, `${post.slug} needs FAQs`);
    assert.ok(postWordCount(post, LIVE) >= 330, `${post.slug} is too short (${postWordCount(post, LIVE)} words)`);
    assert.ok(readingMinutes(post, LIVE) >= 1);

    const ids = post.body.flatMap((b) => (b.type === 'h2' || b.type === 'h3' ? [headingId(b.text)] : []));
    assert.equal(new Set(ids).size, ids.length, `${post.slug} has two headings with the same anchor`);
  }
});

test('internal links resolve to real pages, and no wheel page is linked by hand (the stock rule)', () => {
  const allowed = new Set(['/', '/installs', '/contact', '/sixnine-wheels', '/privacy-policy', '/#catalogue']);
  for (const post of BLOG_POSTS) {
    for (const text of textsOf(post, LIVE)) {
      for (const match of text.matchAll(/\]\(([^)\s]+)\)/g)) {
        const target = match[1];
        if (!target.startsWith('/')) continue; // external links are not checked here
        assert.ok(!target.startsWith('/wheels/'), `${post.slug} links ${target}: wheel pages are linked from the catalogue only`);
        assert.ok(allowed.has(target) || resolveBlogPath(target) !== null, `${post.slug} links ${target}, which is not a page`);
      }
    }
  }
});

test('no article is an orphan: each is linked from another article and points on to others', () => {
  for (const post of BLOG_POSTS) {
    assert.ok(post.more.length >= 2 && post.more.length <= 4, `${post.slug} should point to 2-4 other articles`);
    assert.ok(!post.more.includes(post.slug), `${post.slug} points at itself`);
    assert.equal(morePosts(post).length, post.more.length, `${post.slug} has an unknown slug in "more"`);
    const path = blogPostPath(post);
    const linkedFrom = BLOG_POSTS.filter(
      (other) =>
        other.slug !== post.slug &&
        (other.more.includes(post.slug) || textsOf(other, LIVE).some((t) => t.includes(`](${path})`)))
    );
    assert.ok(linkedFrom.length >= 1, `${post.slug} is not linked from any other article`);
  }
});

test('articles never type a price, size, offset, bolt pattern, lead time or contact detail (AGENTS.md rules 3 and 4)', () => {
  const forbidden: [RegExp, string][] = [
    [/\bR\s?\d/, 'a Rand amount'],
    [/\b[3-6]\s?[x×]\s?1\d\d\b/i, 'a bolt pattern'],
    [/\bET\s?-?\d/i, 'an offset'],
    [/\b\d{2}(\.\d)?\s?mm\b/i, 'a measurement in millimetres'],
    [/\b(?:18|19|20|21|22)\s?(?:"|”|inch|-inch|in\b)/i, 'a wheel size'],
    [/\b66\.\d\b/, 'a centre bore'],
    [/\b\d+\s+(?:weeks?|months?)\b/i, 'a lead time'],
    [/\+?27\s?\d{2}\s?\d{3}\s?\d{4}|\b0\d{2}\s?\d{3}\s?\d{4}\b/, 'a phone number'],
    [/\b\d+\s+(?:sets?|listings?|wheels? in stock)\b/i, 'a stock count'],
  ];
  for (const post of BLOG_POSTS) {
    for (const text of textsOf(post, EMPTY)) {
      for (const [pattern, what] of forbidden) {
        assert.ok(!pattern.test(text), `${post.slug} types ${what} by hand: "${text.slice(0, 90)}"`);
      }
    }
  }
});

test('articles make no claim the business has not confirmed (AGENTS.md rule 2)', () => {
  const banned = /warrant|guarantee|certif|TÜV|TUV|JWL|VIA\b|lifetime|crash.?test|tested to|opening hours|open (?:daily|monday)|we deliver|we ship|nationwide|free (?:fitting|delivery|shipping)|best price|cheapest|\bsame.day\b|financ|instal(?:l)?ment/i;
  for (const post of BLOG_POSTS) {
    for (const text of textsOf(post, LIVE)) {
      assert.equal(banned.exec(text)?.[0], undefined, `${post.slug}: "${text.slice(0, 100)}"`);
    }
  }
  // Any email must be on the business's own domain.
  for (const post of BLOG_POSTS) {
    for (const text of textsOf(post, LIVE)) {
      for (const email of text.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi) ?? []) {
        assert.ok(email.toLowerCase().endsWith(`@${SITE.domain}`), `${post.slug} has an email on another domain`);
      }
    }
  }
});

test('text that depends on the catalogue is built from it, and nothing reads "undefined" with or without stock', () => {
  const wheels = getAllBrandWheels();
  const prices = wheels.map((w) => w.priceZAR);
  assert.equal(LIVE.listingCount, wheels.length);
  assert.equal(LIVE.minPrice, formatZAR(Math.min(...prices)));
  assert.equal(LIVE.maxPrice, formatZAR(Math.max(...prices)));
  for (const pcd of LIVE.pcd) assert.ok(wheels.some((w) => w.technicalSpecSheet?.includes(pcd)), `PCD ${pcd} is not in any spec`);
  for (const bore of LIVE.centreBore) assert.ok(wheels.some((w) => w.technicalSpecSheet?.includes(`CB${bore}`)));
  assert.ok(LIVE.listingCount === 0 || LIVE.offsetRange.startsWith('ET'));

  for (const facts of [LIVE, EMPTY]) {
    for (const post of BLOG_POSTS) {
      for (const text of textsOf(post, facts)) {
        assert.ok(!/undefined|NaN|\[object|null/.test(text), `${post.slug}: "${text.slice(0, 80)}"`);
        assert.ok(!/\(\s*\)|\s,\s|:\s\./.test(text) || text.includes('|'), `${post.slug} has an empty gap: "${text.slice(0, 80)}"`);
      }
    }
  }

  // With nothing in stock the articles still read, and the dynamic paragraphs drop out instead of going blank.
  const empty = catalogueFacts([]);
  assert.equal(empty.priceRange, '');
  assert.deepEqual(designRows([]), []);
});

test('the design table has one row per design in stock, priced from the cheapest listing', () => {
  const rows = designRows();
  const wheels = getAllBrandWheels();
  const designs = new Set(wheels.map((w) => w.modelCode || w.model));
  assert.equal(rows.length, designs.size);
  for (const row of rows) {
    const listings = wheels.filter((w) => (w.modelCode || w.model) === row.design);
    assert.equal(row.from, formatZAR(Math.min(...listings.map((w) => w.priceZAR))));
    assert.ok(listings.some((w) => w.slug === row.slug));
  }
});

test('blog paths resolve exactly: hub, pillar, article, and nothing with extra or unknown segments', () => {
  assert.deepEqual(resolveBlogPath('/blog'), { kind: 'index' });
  assert.deepEqual(resolveBlogPath('/blog/'), { kind: 'index' });
  for (const pillar of BLOG_PILLARS) {
    assert.equal(resolveBlogPath(`/blog/${pillar.slug}`)?.kind, 'pillar');
  }
  for (const post of BLOG_POSTS) {
    const route = resolveBlogPath(blogPostPath(post));
    assert.equal(route?.kind, 'post');
    assert.equal(getPost(getPillarById(post.pillar).slug, post.slug), post);
  }
  const first = BLOG_POSTS[0];
  const otherPillar = BLOG_PILLARS.find((p) => p.id !== first.pillar)!;
  for (const bad of [
    '/blog/nope',
    `/blog/${otherPillar.slug}/${first.slug}`, // right article, wrong pillar
    `${blogPostPath(first)}/extra`,
    '/blog/feed.xml/x',
    '/blogs',
    '/',
  ]) {
    assert.equal(resolveBlogPath(bad), null, bad);
  }
  assert.equal(latestPosts(3).length, 3);
  assert.equal(plainText('See [the guide](/blog) for **more**'), 'See the guide for more');
});
