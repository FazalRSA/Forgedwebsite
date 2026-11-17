import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Breadcrumb } from '../ui/breadcrumb';
import { Link } from '../../utils/router';
import { getAllBrandWheels } from '../../data/catalogue';
import {
  BLOG_PILLARS,
  blogPillarPath,
  blogPostPath,
  catalogueFacts,
  formatDate,
  getPillarById,
  readingMinutes,
  type BlogPost,
} from '../../data/blog';
import { latestPosts, morePosts, postsInPillar, resolveBlogPath } from '../../data/blogPosts';
import { BLOG_HUB } from '../../utils/blogSeo';
import { ArticleBody } from './ArticleBody';
import { Faq } from './Faq';
import { BODY_LINK_CLASS, Inline } from './Inline';

/**
 * The blog pages as plain HTML for crawlers and for visitors without JavaScript. scripts/prerender-meta.ts
 * writes this into <div id="root"> of each blog page's HTML file; the app replaces it as soon as it
 * loads. It carries the full article text, headings, tables, FAQ and internal links, which is what a
 * search engine's first, JavaScript-free pass reads. No hooks and no store, so it renders on the server.
 */

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#111111] text-[#EDEBE4]">
    <header className="border-b border-[#26262E] px-4 sm:px-6 md:px-10 h-16 flex items-center gap-6">
      <Link to="/" className="font-semibold text-white">
        FORGED Custom Wheels
      </Link>
      <nav aria-label="Main" className="flex gap-4 text-sm text-[#C2C2CC]">
        <Link to="/#catalogue">Wheels</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/installs">Installs</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    </header>
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">{children}</main>
  </div>
);

const PostList: React.FC<{ posts: BlogPost[] }> = ({ posts }) => (
  <ul className="mt-6 space-y-5">
    {posts.map((post) => (
      <li key={post.slug}>
        <h3 className="text-lg font-semibold">
          <Link to={blogPostPath(post)} className={BODY_LINK_CLASS}>
            {post.title}
          </Link>
        </h3>
        <p className="mt-1 text-[#C2C2CC]">{post.excerpt}</p>
      </li>
    ))}
  </ul>
);

function StaticPost({ post }: { post: BlogPost }) {
  const wheels = getAllBrandWheels();
  const facts = catalogueFacts(wheels);
  const pillar = getPillarById(post.pillar);
  const next = morePosts(post);
  return (
    <Shell>
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Blog', to: '/blog' },
          { label: pillar.name, to: blogPillarPath(pillar) },
          { label: post.title },
        ]}
      />
      <article className="mt-8">
        <h1 className="text-3xl sm:text-5xl font-black leading-[1.05] text-white">{post.title}</h1>
        <p className="mt-5 text-lg text-[#C2C2CC]">{post.description}</p>
        <p className="mt-4 text-sm text-[#8E8E99]">
          By FORGED Custom Wheels · Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time> ·{' '}
          {readingMinutes(post, facts)} min read
        </p>
        <ArticleBody post={post} facts={facts} wheels={wheels} />
        <Faq faqs={post.faqs} facts={facts} />
      </article>
      {next.length > 0 && (
        <section className="mt-14 border-t border-[#26262E] pt-8">
          <h2 className="text-2xl font-semibold text-white">Keep reading</h2>
          <PostList posts={next} />
        </section>
      )}
    </Shell>
  );
}

function StaticPillar({ pillarSlug }: { pillarSlug: string }) {
  const pillar = BLOG_PILLARS.find((p) => p.slug === pillarSlug)!;
  return (
    <Shell>
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: pillar.name }]} />
      <h1 className="mt-8 text-3xl sm:text-5xl font-black leading-[1.05] text-white">{pillar.title}</h1>
      {pillar.intro.map((paragraph) => (
        <p key={paragraph} className="mt-5 text-lg text-[#C2C2CC]">
          <Inline text={paragraph} />
        </p>
      ))}
      <PostList posts={postsInPillar(pillar.id)} />
    </Shell>
  );
}

function StaticIndex() {
  return (
    <Shell>
      <h1 className="text-4xl sm:text-6xl font-black leading-[1.02] text-white">{BLOG_HUB.title}</h1>
      <p className="mt-5 text-lg text-[#C2C2CC]">{BLOG_HUB.description}</p>
      <h2 className="mt-12 text-2xl font-semibold text-white">Topics</h2>
      <ul className="mt-4 space-y-4">
        {BLOG_PILLARS.map((pillar) => (
          <li key={pillar.id}>
            <Link to={blogPillarPath(pillar)} className={BODY_LINK_CLASS}>
              {pillar.name}
            </Link>
            <p className="mt-1 text-[#C2C2CC]">{pillar.description}</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 text-2xl font-semibold text-white">Latest guides</h2>
      <PostList posts={latestPosts()} />
    </Shell>
  );
}

/** The HTML to put inside <div id="root"> for a blog path, or '' when the path is not a blog page. */
export function blogStaticHtml(path: string): string {
  const route = resolveBlogPath(path);
  if (!route) return '';
  if (route.kind === 'index') return renderToStaticMarkup(<StaticIndex />);
  if (route.kind === 'pillar') return renderToStaticMarkup(<StaticPillar pillarSlug={route.pillar.slug} />);
  return renderToStaticMarkup(<StaticPost post={route.post} />);
}
