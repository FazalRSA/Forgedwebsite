import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from '../../utils/router';
import { latestPosts } from '../../data/blogPosts';
import { BlogCard } from './BlogCard';
import { EYEBROW_CLASS } from '../brand/sectionStyles';

/** Three guides on the home page, so the blog is one click from the front door and crawlers find it from /. */
export const BlogTeaser: React.FC = () => {
  const posts = latestPosts(3);
  if (!posts.length) return null;
  return (
    <section
      id="guides"
      aria-labelledby="guides-heading"
      className="border-t border-[#26262E] bg-[#111111] text-[#EDEBE4]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 py-16 sm:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={EYEBROW_CLASS}>The FORGED blog</p>
            <h2 id="guides-heading" className="mt-3 text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white">
              Forged wheel guides
            </h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white underline-offset-4 hover:underline"
          >
            All guides
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
